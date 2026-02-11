import { describe, it, expect } from 'vitest'
import { parseNvcAnalysis } from '../prompts'

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
