import { describe, it, expect } from 'vitest'
import { parseIssueAnalysis, buildIssueAnalysisPrompt, parseNvcAnalysis } from '../prompts'

describe('parseIssueAnalysis', () => {
  it('parses valid JSON with newIssues and gradedIssues', () => {
    const raw = JSON.stringify({
      newIssues: [{ label: 'Workload', description: 'Unfair distribution', raised_by: 'person_a' }],
      gradedIssues: [{ issueId: 'i1', status: 'well_addressed', rationale: 'Good progress' }],
    })
    const result = parseIssueAnalysis(raw)
    expect(result).not.toBeNull()
    expect(result!.newIssues).toHaveLength(1)
    expect(result!.newIssues[0].label).toBe('Workload')
    expect(result!.gradedIssues).toHaveLength(1)
    expect(result!.gradedIssues[0].status).toBe('well_addressed')
  })

  it('returns empty arrays for missing newIssues/gradedIssues', () => {
    const result = parseIssueAnalysis('{}')
    expect(result).not.toBeNull()
    expect(result!.newIssues).toEqual([])
    expect(result!.gradedIssues).toEqual([])
  })

  it('returns null for invalid JSON', () => {
    expect(parseIssueAnalysis('not json')).toBeNull()
  })

  it('strips code fences before parsing', () => {
    const raw = '```json\n{"newIssues": [], "gradedIssues": []}\n```'
    const result = parseIssueAnalysis(raw)
    expect(result).not.toBeNull()
    expect(result!.newIssues).toEqual([])
  })

  it('filters out newIssues missing label or description', () => {
    const raw = JSON.stringify({
      newIssues: [
        { label: 'Valid', description: 'Has both' },
        { label: 'Missing desc' },
        { description: 'Missing label' },
      ],
    })
    const result = parseIssueAnalysis(raw)
    expect(result!.newIssues).toHaveLength(1)
    expect(result!.newIssues[0].label).toBe('Valid')
  })

  it('filters out gradedIssues with invalid status', () => {
    const raw = JSON.stringify({
      gradedIssues: [
        { issueId: 'i1', status: 'well_addressed', rationale: 'ok' },
        { issueId: 'i2', status: 'invalid_status', rationale: 'bad' },
      ],
    })
    const result = parseIssueAnalysis(raw)
    expect(result!.gradedIssues).toHaveLength(1)
  })
})

describe('buildIssueAnalysisPrompt', () => {
  it('returns a string containing the target message', () => {
    const result = buildIssueAnalysisPrompt(
      [],
      { sender: 'person_a', senderName: 'Alice', content: 'This is unfair' },
      'Bob',
      [],
    )
    expect(result).toContain('This is unfair')
    expect(result).toContain('Alice')
    expect(result).toContain('Bob')
  })

  it('includes existing issues in prompt', () => {
    const existingIssues = [
      { id: 'i1', label: 'Workload', description: 'Unfair distribution', raised_by: 'person_a', status: 'unaddressed' },
    ]
    const result = buildIssueAnalysisPrompt(
      [],
      { sender: 'person_a', senderName: 'Alice', content: 'test' },
      'Bob',
      existingIssues,
    )
    expect(result).toContain('Workload')
    expect(result).toContain('Unfair distribution')
  })
})

describe('parseNvcAnalysis', () => {
  it('parses valid NVC JSON', () => {
    const raw = JSON.stringify({
      observation: 'obs',
      feeling: 'frustrated',
      need: 'connection',
      request: 'listen to me',
      subtext: 'I feel alone',
      blindSpots: ['accusatory tone'],
      unmetNeeds: ['respect'],
      nvcTranslation: 'When I...',
      emotionalTemperature: 0.7,
    })
    const result = parseNvcAnalysis(raw)
    expect(result).not.toBeNull()
    expect(result!.observation).toBe('obs')
    expect(result!.emotionalTemperature).toBe(0.7)
  })

  it('returns null when required fields are missing', () => {
    expect(parseNvcAnalysis(JSON.stringify({ feeling: 'sad' }))).toBeNull()
  })

  it('returns null for invalid JSON', () => {
    expect(parseNvcAnalysis('broken')).toBeNull()
  })

  it('clamps emotionalTemperature to 0-1 range', () => {
    const raw = JSON.stringify({
      observation: 'obs',
      feeling: 'sad',
      subtext: 'sub',
      emotionalTemperature: 5.0,
    })
    const result = parseNvcAnalysis(raw)
    expect(result!.emotionalTemperature).toBe(1)
  })

  it('handles missing optional fields gracefully', () => {
    const raw = JSON.stringify({
      observation: 'obs',
      feeling: 'sad',
      subtext: 'sub',
    })
    const result = parseNvcAnalysis(raw)
    expect(result).not.toBeNull()
    expect(result!.need).toBe('')
    expect(result!.request).toBe('')
    expect(result!.blindSpots).toEqual([])
    expect(result!.unmetNeeds).toEqual([])
    expect(result!.emotionalTemperature).toBe(0.5)
  })
})
