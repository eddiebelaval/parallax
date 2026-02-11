import Anthropic from '@anthropic-ai/sdk'
import { buildConflictIntelligencePrompt, getMaxTokensForMode } from '@/lib/prompts/index'
import { SESSION_SUMMARY_PROMPT, ISSUE_ANALYSIS_PROMPT, buildIssueAnalysisPrompt } from '@/lib/prompts'
import { buildMediationPrompt } from '@/lib/prompts/index'
import type { MessageSender, ContextMode } from '@/types/database'

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY — add it to .env.local')
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

export interface ConversationEntry {
  sender: string
  content: string
}

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')
}

/**
 * Call Claude to produce a Conflict Intelligence analysis for a message.
 *
 * V3: Uses context-mode-aware prompt with multi-lens analysis.
 * Returns the raw text from Claude's response. The caller should
 * parse it with parseConflictAnalysis() from prompts/index.ts.
 */
export async function mediateMessage(
  messageContent: string,
  sender: MessageSender,
  senderName: string,
  otherPersonName: string,
  conversationHistory: ConversationEntry[],
  contextMode: ContextMode = 'intimate',
  sessionContext?: { goals?: string[]; contextSummary?: string },
): Promise<string> {
  const userPrompt = buildMediationPrompt(
    conversationHistory,
    { sender, senderName, content: messageContent },
    otherPersonName,
  )

  const systemPrompt = buildConflictIntelligencePrompt(contextMode, sessionContext)
  const maxTokens = getMaxTokensForMode(contextMode)

  const response = await getClient().messages.create({
    model: 'claude-opus-4-6',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  return extractText(response)
}

/**
 * Lightweight conductor call — used for onboarding greetings,
 * acknowledgments, synthesis, and interventions.
 */
export async function conductorMessage(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 512,
): Promise<string> {
  const response = await getClient().messages.create({
    model: 'claude-opus-4-6',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })
  return extractText(response)
}

/**
 * Call Claude to analyze a message for issues (extract new + grade existing).
 *
 * Returns the raw text. Caller should parse with parseIssueAnalysis().
 */
export async function analyzeIssues(
  messageContent: string,
  sender: MessageSender,
  senderName: string,
  otherPersonName: string,
  conversationHistory: ConversationEntry[],
  existingIssues: Array<{ id: string; label: string; description: string; raised_by: string; status: string }>,
): Promise<string> {
  const userPrompt = buildIssueAnalysisPrompt(
    conversationHistory,
    { sender, senderName, content: messageContent },
    otherPersonName,
    existingIssues,
  )

  const response = await getClient().messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: ISSUE_ANALYSIS_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  return extractText(response)
}

export interface V3MessageContext {
  primaryInsight: string
  resolutionDirection: string
  activeLenses: string[]
}

/**
 * Call Claude to produce a session summary analyzing the full conversation arc.
 *
 * V3: When messages have Conflict Intelligence analysis, the summary prompt
 * includes lens insights and resolution direction trends for richer context.
 *
 * Returns the raw text from Claude's response. The caller should
 * parse it with parseSessionSummary().
 */
export async function summarizeSession(
  personAName: string,
  personBName: string,
  conversationHistory: ConversationEntry[],
  v3Context?: V3MessageContext[],
  sessionGoals?: string[],
): Promise<string> {
  const transcript = conversationHistory
    .map((m) => `[${m.sender}]: ${m.content}`)
    .join('\n')

  let v3Section = ''
  if (v3Context && v3Context.length > 0) {
    const directions = v3Context.map((c) => c.resolutionDirection)
    const insights = v3Context
      .filter((c) => c.primaryInsight)
      .map((c, i) => `  Message ${i + 1}: ${c.primaryInsight} [${c.resolutionDirection}]`)
      .join('\n')
    const allLenses = v3Context.flatMap((c) => c.activeLenses)
    const lensCounts = allLenses.reduce<Record<string, number>>((acc, l) => {
      acc[l] = (acc[l] || 0) + 1
      return acc
    }, {})
    const topLenses = Object.entries(lensCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => `${name} (${count}x)`)
      .join(', ')

    v3Section = `

CONFLICT INTELLIGENCE DATA (per-message analysis):
Resolution direction trend: ${directions.join(' -> ')}
Most activated lenses: ${topLenses}
Per-message insights:
${insights}`
  }

  let goalsSection = ''
  if (sessionGoals && sessionGoals.length > 0) {
    goalsSection = `

SESSION GOALS (established at the start):
${sessionGoals.map((g, i) => `${i + 1}. ${g}`).join('\n')}

In your summary, note which goals were addressed and which remain open.`
  }

  const userPrompt = `PARTICIPANTS:
- Person A: ${personAName}
- Person B: ${personBName}

FULL CONVERSATION:
${transcript}${v3Section}${goalsSection}`

  const response = await getClient().messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    system: SESSION_SUMMARY_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  return extractText(response)
}
