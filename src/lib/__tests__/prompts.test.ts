import { describe, it, expect } from 'vitest'
import { parseNvcAnalysis } from '../prompts'
import { parseConflictAnalysis } from '../prompts/index'
import type { ContextMode } from '@/types/database'

const validPayload = {
  observation: 'You raised your voice during the discussion',
  feeling: 'Frustrated and unheard',
  need: 'To feel respected in conversation',
  request: 'Could we agree to take turns speaking?',
  subtext: 'I feel like my opinions do not matter to you',
  blindSpots: ['Dismissing partner feelings', 'Interrupting frequently'],
  unmetNeeds: ['Respect', 'Autonomy', 'Being heard'],
  nvcTranslation: 'When I notice raised voices, I feel frustrated because I need mutual respect.',
  emotionalTemperature: 0.7,
}

describe('parseNvcAnalysis', () => {
  it('parses valid JSON', () => {
    const result = parseNvcAnalysis(JSON.stringify(validPayload))
    expect(result).not.toBeNull()
    expect(result!.observation).toBe(validPayload.observation)
    expect(result!.feeling).toBe(validPayload.feeling)
    expect(result!.subtext).toBe(validPayload.subtext)
    expect(result!.emotionalTemperature).toBe(0.7)
  })

  it('handles JSON wrapped in code fences', () => {
    const fenced = '```json\n' + JSON.stringify(validPayload) + '\n```'
    const result = parseNvcAnalysis(fenced)
    expect(result).not.toBeNull()
    expect(result!.observation).toBe(validPayload.observation)
  })

  it('clamps emotionalTemperature to 0-1', () => {
    const overMax = { ...validPayload, emotionalTemperature: 1.5 }
    expect(parseNvcAnalysis(JSON.stringify(overMax))!.emotionalTemperature).toBe(1)

    const underMin = { ...validPayload, emotionalTemperature: -0.3 }
    expect(parseNvcAnalysis(JSON.stringify(underMin))!.emotionalTemperature).toBe(0)
  })

  it('defaults emotionalTemperature to 0.5 if not a number', () => {
    const noTemp = { ...validPayload, emotionalTemperature: 'high' }
    expect(parseNvcAnalysis(JSON.stringify(noTemp))!.emotionalTemperature).toBe(0.5)
  })

  it('handles missing optional fields gracefully', () => {
    const minimal = {
      observation: 'Observed something',
      feeling: 'Sad',
      subtext: 'Deeper meaning',
    }
    const result = parseNvcAnalysis(JSON.stringify(minimal))
    expect(result).not.toBeNull()
    expect(result!.need).toBe('')
    expect(result!.request).toBe('')
    expect(result!.blindSpots).toEqual([])
    expect(result!.unmetNeeds).toEqual([])
    expect(result!.nvcTranslation).toBe('')
  })

  it('supports alternate field name translated_message', () => {
    const altField = {
      ...validPayload,
      nvcTranslation: undefined,
      translated_message: 'Alternate translation',
    }
    const result = parseNvcAnalysis(JSON.stringify(altField))
    expect(result!.nvcTranslation).toBe('Alternate translation')
  })

  it('returns null for missing required fields', () => {
    expect(parseNvcAnalysis(JSON.stringify({ feeling: 'Sad' }))).toBeNull()
    expect(parseNvcAnalysis(JSON.stringify({ observation: 'X' }))).toBeNull()
    expect(parseNvcAnalysis(JSON.stringify({ observation: 'X', feeling: 'Y' }))).toBeNull()
  })

  it('returns null for invalid JSON', () => {
    expect(parseNvcAnalysis('not json at all')).toBeNull()
    expect(parseNvcAnalysis('')).toBeNull()
  })

  it('coerces non-array blindSpots to empty array', () => {
    const bad = { ...validPayload, blindSpots: 'just a string' }
    expect(parseNvcAnalysis(JSON.stringify(bad))!.blindSpots).toEqual([])
  })
})

// --- V3: parseConflictAnalysis tests ---

const v3Payload = {
  ...validPayload,
  lenses: {
    nvc: validPayload,
    gottman: {
      horsemen: [{ type: 'criticism', evidence: 'You always do this' }],
      repairAttempts: [],
      positiveToNegativeRatio: '1:3',
      startupType: 'harsh',
    },
  },
  meta: {
    contextMode: 'family',
    activeLenses: ['nvc', 'gottman', 'narrative', 'dramaTriangle', 'attachment', 'power', 'restorative'],
    primaryInsight: 'The conversation reveals a pattern of criticism masking a need for acknowledgment.',
    overallSeverity: 0.65,
    resolutionDirection: 'stable',
  },
}

describe('parseConflictAnalysis', () => {
  const mode: ContextMode = 'family'

  it('parses a full V3 payload with lenses and meta', () => {
    const result = parseConflictAnalysis(JSON.stringify(v3Payload), mode)
    expect(result).not.toBeNull()
    expect(result!.observation).toBe(validPayload.observation)
    expect(result!.lenses.gottman).toBeDefined()
    expect(result!.meta.contextMode).toBe('family')
    expect(result!.meta.primaryInsight).toContain('criticism')
    expect(result!.meta.overallSeverity).toBe(0.65)
    expect(result!.meta.resolutionDirection).toBe('stable')
  })

  it('preserves NVC root fields for backward compat', () => {
    const result = parseConflictAnalysis(JSON.stringify(v3Payload), mode)!
    expect(result.feeling).toBe(validPayload.feeling)
    expect(result.subtext).toBe(validPayload.subtext)
    expect(result.blindSpots).toEqual(validPayload.blindSpots)
    expect(result.nvcTranslation).toBe(validPayload.nvcTranslation)
  })

  it('handles V3 with sparse lenses (only nvc + gottman populated)', () => {
    const sparse = {
      ...validPayload,
      lenses: { nvc: validPayload, gottman: v3Payload.lenses.gottman },
      meta: v3Payload.meta,
    }
    const result = parseConflictAnalysis(JSON.stringify(sparse), mode)
    expect(result).not.toBeNull()
    expect(result!.lenses.gottman).toBeDefined()
    expect(result!.lenses.attachment).toBeUndefined()
    expect(result!.lenses.narrative).toBeUndefined()
  })

  it('wraps V1 payload (no lenses/meta) in V3 envelope with defaults', () => {
    const result = parseConflictAnalysis(JSON.stringify(validPayload), mode)
    expect(result).not.toBeNull()
    // V3 envelope should exist
    expect(result!.lenses).toBeDefined()
    expect(result!.meta).toBeDefined()
    // Meta should use sensible defaults
    expect(result!.meta.contextMode).toBe(mode)
    expect(result!.meta.activeLenses).toEqual(
      expect.arrayContaining(['nvc'])
    )
    expect(result!.meta.primaryInsight).toBe(validPayload.subtext)
    expect(result!.meta.overallSeverity).toBe(validPayload.emotionalTemperature)
    expect(result!.meta.resolutionDirection).toBe('stable')
  })

  it('returns null for missing required NVC root fields (no observation)', () => {
    const missing = { feeling: 'Sad', subtext: 'Deep', lenses: {}, meta: {} }
    expect(parseConflictAnalysis(JSON.stringify(missing), mode)).toBeNull()
  })

  it('returns null for missing required NVC root fields (no feeling)', () => {
    const missing = { observation: 'X', subtext: 'Deep', lenses: {}, meta: {} }
    expect(parseConflictAnalysis(JSON.stringify(missing), mode)).toBeNull()
  })

  it('returns null for missing required NVC root fields (no subtext)', () => {
    const missing = { observation: 'X', feeling: 'Y', lenses: {}, meta: {} }
    expect(parseConflictAnalysis(JSON.stringify(missing), mode)).toBeNull()
  })

  it('returns null for invalid JSON', () => {
    expect(parseConflictAnalysis('not json', mode)).toBeNull()
    expect(parseConflictAnalysis('', mode)).toBeNull()
    expect(parseConflictAnalysis('```json\n{broken```', mode)).toBeNull()
  })

  it('clamps emotionalTemperature in V3 context', () => {
    const hot = { ...v3Payload, emotionalTemperature: 2.5 }
    const result = parseConflictAnalysis(JSON.stringify(hot), mode)!
    expect(result.emotionalTemperature).toBe(1)

    const cold = { ...v3Payload, emotionalTemperature: -1 }
    const result2 = parseConflictAnalysis(JSON.stringify(cold), mode)!
    expect(result2.emotionalTemperature).toBe(0)
  })

  it('clamps overallSeverity in meta', () => {
    const payload = {
      ...v3Payload,
      meta: { ...v3Payload.meta, overallSeverity: 5.0 },
    }
    const result = parseConflictAnalysis(JSON.stringify(payload), mode)!
    expect(result.meta.overallSeverity).toBe(1)

    const payload2 = {
      ...v3Payload,
      meta: { ...v3Payload.meta, overallSeverity: -0.5 },
    }
    const result2 = parseConflictAnalysis(JSON.stringify(payload2), mode)!
    expect(result2.meta.overallSeverity).toBe(0)
  })

  it('falls back activeLenses from CONTEXT_MODE_LENSES when meta.activeLenses missing', () => {
    const payload = {
      ...v3Payload,
      meta: { ...v3Payload.meta, activeLenses: undefined },
    }
    const result = parseConflictAnalysis(JSON.stringify(payload), mode)!
    // Should use the family mode lens list, which starts with 'nvc'
    expect(result.meta.activeLenses[0]).toBe('nvc')
    expect(result.meta.activeLenses.length).toBeGreaterThanOrEqual(5)
  })

  it('defaults resolutionDirection to stable for invalid values', () => {
    const payload = {
      ...v3Payload,
      meta: { ...v3Payload.meta, resolutionDirection: 'unknown' },
    }
    const result = parseConflictAnalysis(JSON.stringify(payload), mode)!
    expect(result.meta.resolutionDirection).toBe('stable')
  })

  it('handles code-fenced V3 response', () => {
    const fenced = '```json\n' + JSON.stringify(v3Payload) + '\n```'
    const result = parseConflictAnalysis(fenced, mode)
    expect(result).not.toBeNull()
    expect(result!.meta.primaryInsight).toContain('criticism')
  })

  it('defaults non-number emotionalTemperature to 0.5', () => {
    const payload = { ...v3Payload, emotionalTemperature: 'very hot' }
    const result = parseConflictAnalysis(JSON.stringify(payload), mode)!
    expect(result.emotionalTemperature).toBe(0.5)
  })

  it('handles lenses as non-object gracefully', () => {
    const payload = { ...validPayload, lenses: 'invalid', meta: v3Payload.meta }
    const result = parseConflictAnalysis(JSON.stringify(payload), mode)!
    expect(result.lenses).toEqual({})
  })
})
