import fs from 'fs'
import path from 'path'
import type { ConversationalMode } from '@/types/conversation'

/**
 * Knowledge Base Loader
 *
 * Assembles Parallax's system prompt from markdown files. No inline
 * persona strings — identity lives in docs/parallax/, mode-specific
 * knowledge lives in docs/explorer/ and docs/guide/.
 *
 * Prompt structure:
 *   [shared persona: docs/parallax/*.md]
 *   [mode framing: one-line context for Explorer vs Guide]
 *   [mode knowledge: docs/explorer/*.md or docs/guide/*.md]
 *   [project docs: BUILDING.md, CLAUDE.md — Explorer only]
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

// ─── Shared Persona (cached after first load) ───

let _personaCache: string | null = null

function loadSharedPersona(): string {
  if (_personaCache !== null) return _personaCache
  _personaCache = readDirMarkdown(path.join(PROJECT_ROOT, 'docs', 'parallax'))
  return _personaCache
}

// ─── Mode-Specific Knowledge (cached after first load) ───

let _explorerCache: string | null = null
let _guideCache: string | null = null

function loadExplorerKnowledge(): string {
  if (_explorerCache !== null) return _explorerCache
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

  _explorerCache = sections.join('\n\n')
  return _explorerCache
}

function loadGuideKnowledge(): string {
  if (_guideCache !== null) return _guideCache
  _guideCache = readDirMarkdown(path.join(PROJECT_ROOT, 'docs', 'guide'))
  return _guideCache
}

export function loadKnowledgeBase(mode: ConversationalMode): string {
  return mode === 'explorer' ? loadExplorerKnowledge() : loadGuideKnowledge()
}

// ─── Mode Framing ───

const MODE_FRAMING: Record<ConversationalMode, string> = {
  explorer: 'CONTEXT: You are speaking to judges, developers, and curious visitors on the landing page. Go deep when asked. Tell the story behind the decision. Cite PRs, pipeline stages, architectural trade-offs.',
  guide: 'CONTEXT: You are helping an active user inside the product. Be concise. Get to the point. Use simple language. If they ask about a personal conflict, redirect them to start a session.',
}

// ─── System Prompt Assembly ───

export function getSystemPrompt(mode: ConversationalMode): string {
  const persona = loadSharedPersona()
  const framing = MODE_FRAMING[mode]
  const knowledge = loadKnowledgeBase(mode)
  const knowledgeLabel = mode === 'explorer' ? 'KNOWLEDGE BASE' : 'PRODUCT KNOWLEDGE'

  const parts = [persona, framing]
  if (knowledge) parts.push(`${knowledgeLabel}:\n${knowledge}`)

  return parts.join('\n\n')
}
