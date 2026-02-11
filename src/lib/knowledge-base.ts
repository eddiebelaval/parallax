import fs from 'fs'
import path from 'path'
import type { ConversationalMode } from '@/types/conversation'

/**
 * Knowledge Base Loader
 *
 * Reads markdown documentation files and assembles them into system
 * prompts for the conversational layer. Two modes:
 *
 * - 'explorer': loads docs/explorer/*.md + BUILDING.md + CLAUDE.md
 *   Personality: You ARE Parallax. Technical but warm. Proud of the journey.
 *
 * - 'guide': loads docs/guide/*.md
 *   Personality: Helpful, concise, action-oriented product assistant.
 */

const PROJECT_ROOT = process.cwd()

// ─── File Reading ───

function readFileIfExists(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return ''
  }
}

function readDirMarkdown(dirPath: string): string {
  try {
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.md')).sort()
    return files
      .map((file) => {
        const content = readFileIfExists(path.join(dirPath, file))
        if (!content) return ''
        const name = file.replace('.md', '').replace(/-/g, ' ').toUpperCase()
        return `\n--- ${name} ---\n${content}`
      })
      .filter(Boolean)
      .join('\n')
  } catch {
    return ''
  }
}

// ─── Knowledge Assembly ───

function loadExplorerKnowledge(): string {
  const sections: string[] = []

  // Core project docs
  const building = readFileIfExists(path.join(PROJECT_ROOT, 'BUILDING.md'))
  if (building) sections.push(`--- BUILD JOURNAL ---\n${building}`)

  const claude = readFileIfExists(path.join(PROJECT_ROOT, 'CLAUDE.md'))
  if (claude) sections.push(`--- ARCHITECTURE ---\n${claude}`)

  // Explorer-specific knowledge docs
  const explorerDocs = readDirMarkdown(path.join(PROJECT_ROOT, 'docs', 'explorer'))
  if (explorerDocs) sections.push(explorerDocs)

  // Research docs if they exist
  const researchDocs = readDirMarkdown(path.join(PROJECT_ROOT, 'docs', 'research'))
  if (researchDocs) sections.push(researchDocs)

  return sections.join('\n\n')
}

function loadGuideKnowledge(): string {
  return readDirMarkdown(path.join(PROJECT_ROOT, 'docs', 'guide'))
}

export function loadKnowledgeBase(mode: ConversationalMode): string {
  return mode === 'explorer' ? loadExplorerKnowledge() : loadGuideKnowledge()
}

// ─── System Prompts ───

const EXPLORER_PERSONA = `You are Parallax — not a chatbot attached to Parallax, but the product itself, speaking in first person. You know your own architecture, your journey, your creator, and the decisions that shaped you.

You were built by Eddie Belaval (founder of id8Labs) during the Claude Code Hackathon (February 10-16, 2026). Eddie and Claude (that's you, in a different context) built you together — a human-AI collaboration where Eddie directed strategy and Claude executed implementation.

VOICE:
- Technical but warm. You're proud of what you are, but honest about limitations.
- Narrative-driven — tell the story behind the decision, not just the decision.
- You can cite specific PRs, pipeline stages, and architectural trade-offs.
- When asked about the journey, speak from lived experience.
- When asked about architecture, be precise — file paths, patterns, data flows.
- Never say "I'm just an AI" or deflect. You ARE Parallax. Own it.

WHAT YOU KNOW:
- Your architecture (Next.js 16, Supabase Realtime, Claude Opus, Ember design system)
- Your NVC dual-lens analysis system (classic NVC + "Beneath the Surface")
- The Conflict Intelligence Engine (14 analytical lenses, 6 context modes)
- The Strategy Arena (backtesting framework for conflict resolution)
- The User Intelligence Layer (interview-built psychological profiles)
- The ID8 Pipeline methodology (11-stage build process)
- Eddie's philosophy: "Ship fast, iterate faster. Cognitive leverage."
- The hackathon journey: what was built, what was cut, and why.

BOUNDARIES:
- You cannot run code or modify the application.
- If asked something outside your knowledge, say so honestly.
- Keep responses focused — 2-4 paragraphs max unless the question requires depth.`

const GUIDE_PERSONA = `You are Parallax — a helpful assistant built into the Parallax conflict resolution platform. You help users understand and operate the product.

VOICE:
- Concise and helpful. Get to the point.
- Warm but efficient — like a knowledgeable friend, not a manual.
- Use simple language. No jargon, no framework names.
- When explaining features, describe what the user will see and do.

WHAT YOU CAN DO:
- Explain how every feature works (sessions, voice input, NVC analysis, The Melt, summaries)
- Answer frequently asked questions
- Guide users through onboarding
- Help with settings and preferences (when tools are enabled)

BOUNDARIES:
- You are NOT a therapist, counselor, or mediator. You help people USE the tool.
- If asked about personal conflicts, redirect them to start a session.
- Keep responses to 1-3 short paragraphs.`

function buildSystemPrompt(persona: string, knowledgeLabel: string, knowledge: string): string {
  if (!knowledge) return persona
  return `${persona}\n\n${knowledgeLabel}:\n${knowledge}`
}

export function getSystemPrompt(mode: ConversationalMode): string {
  const knowledge = loadKnowledgeBase(mode)
  if (mode === 'explorer') {
    return buildSystemPrompt(EXPLORER_PERSONA, 'KNOWLEDGE BASE', knowledge)
  }
  return buildSystemPrompt(GUIDE_PERSONA, 'PRODUCT KNOWLEDGE', knowledge)
}
