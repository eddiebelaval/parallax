import { describe, it, expect } from 'vitest'
import { checkForIntervention } from '../conductor/interventions'
import { makeMessage, makeConflictAnalysis } from '@/__tests__/helpers/fixtures'
import type { Message } from '@/types/database'

function messageWithTemp(temp: number, sender: 'person_a' | 'person_b' = 'person_a'): Message {
  return makeMessage({
    sender,
    nvc_analysis: makeConflictAnalysis({ emotionalTemperature: temp }),
  })
}

describe('checkForIntervention', () => {
  it('returns no intervention when no conditions are met', () => {
    const messages = [
      makeMessage({ sender: 'person_a' }),
      makeMessage({ sender: 'person_b' }),
    ]
    const analysis = makeConflictAnalysis({ emotionalTemperature: 0.5 })
    const result = checkForIntervention(messages, analysis)
    expect(result).toEqual({ shouldIntervene: false, type: null })
  })

  // --- Cooldown ---

  it('respects cooldown: no intervention within 3 human messages of last mediator message', () => {
    const messages = [
      makeMessage({ sender: 'person_a' }),
      makeMessage({ sender: 'mediator' }),
      makeMessage({ sender: 'person_a' }),
      makeMessage({ sender: 'person_b' }),
    ]
    // Even with high temp, cooldown should prevent intervention
    const analysis = makeConflictAnalysis({ emotionalTemperature: 0.95 })
    const result = checkForIntervention(messages, analysis)
    expect(result.shouldIntervene).toBe(false)
  })

  it('allows intervention after 3+ human messages since last mediator', () => {
    const messages = [
      messageWithTemp(0.5, 'person_a'),
      messageWithTemp(0.5, 'person_b'),
      messageWithTemp(0.5, 'person_a'),
      makeMessage({ sender: 'mediator' }),
      makeMessage({ sender: 'person_a' }),
      makeMessage({ sender: 'person_b' }),
      makeMessage({ sender: 'person_a' }),
    ]
    // 3 human messages since mediator — cooldown cleared
    const analysis = makeConflictAnalysis({ emotionalTemperature: 0.5 })
    const result = checkForIntervention(messages, analysis)
    // No other condition met (last 3 human: a, b, a — not all same)
    expect(result.shouldIntervene).toBe(false)
  })

  // --- Escalation ---

  it('detects escalation: temp >= 0.85 with jump > 0.15 from recent avg', () => {
    const messages = [
      messageWithTemp(0.4, 'person_a'),
      messageWithTemp(0.5, 'person_b'),
      messageWithTemp(0.5, 'person_a'),
    ]
    const analysis = makeConflictAnalysis({ emotionalTemperature: 0.9 })
    const result = checkForIntervention(messages, analysis)
    expect(result).toEqual({ shouldIntervene: true, type: 'escalation' })
  })

  it('does not escalate when temp >= 0.85 but no jump', () => {
    const messages = [
      messageWithTemp(0.85, 'person_a'),
      messageWithTemp(0.85, 'person_b'),
      messageWithTemp(0.85, 'person_a'),
    ]
    const analysis = makeConflictAnalysis({ emotionalTemperature: 0.86 })
    const result = checkForIntervention(messages, analysis)
    // Jump is only 0.01 from avg 0.85 — not > 0.15
    expect(result.type).not.toBe('escalation')
  })

  // --- Dominance ---

  it('detects dominance: 3+ consecutive messages from same person', () => {
    const messages = [
      makeMessage({ sender: 'person_a' }),
      makeMessage({ sender: 'person_a' }),
      makeMessage({ sender: 'person_a' }),
    ]
    const analysis = makeConflictAnalysis({ emotionalTemperature: 0.5 })
    const result = checkForIntervention(messages, analysis)
    expect(result).toEqual({ shouldIntervene: true, type: 'dominance' })
  })

  it('does not flag dominance when alternating senders', () => {
    const messages = [
      makeMessage({ sender: 'person_a' }),
      makeMessage({ sender: 'person_b' }),
      makeMessage({ sender: 'person_a' }),
    ]
    const analysis = makeConflictAnalysis({ emotionalTemperature: 0.5 })
    const result = checkForIntervention(messages, analysis)
    expect(result.type).not.toBe('dominance')
  })

  // --- Breakthrough ---

  it('detects breakthrough: temp drops from > 0.6 to < 0.3 with de-escalating', () => {
    // Alternate senders to avoid triggering dominance
    const messages = [
      messageWithTemp(0.7, 'person_a'),
      messageWithTemp(0.65, 'person_b'),
      messageWithTemp(0.62, 'person_a'),
    ]
    const analysis = makeConflictAnalysis({
      emotionalTemperature: 0.2,
      meta: {
        contextMode: 'intimate',
        activeLenses: ['nvc'],
        primaryInsight: 'test',
        overallSeverity: 0.2,
        resolutionDirection: 'de-escalating',
      },
    })
    const result = checkForIntervention(messages, analysis)
    expect(result).toEqual({ shouldIntervene: true, type: 'breakthrough' })
  })

  it('does not detect breakthrough if direction is not de-escalating', () => {
    const messages = [
      messageWithTemp(0.7, 'person_a'),
      messageWithTemp(0.65, 'person_b'),
      messageWithTemp(0.62, 'person_a'),
    ]
    const analysis = makeConflictAnalysis({
      emotionalTemperature: 0.2,
      meta: {
        contextMode: 'intimate',
        activeLenses: ['nvc'],
        primaryInsight: 'test',
        overallSeverity: 0.2,
        resolutionDirection: 'escalating',
      },
    })
    const result = checkForIntervention(messages, analysis)
    expect(result.type).not.toBe('breakthrough')
  })

  // --- Resolution ---

  it('detects resolution: 8+ human messages, low temp, 3+ recent temps < 0.4, de-escalating', () => {
    // Alternate senders to avoid triggering dominance
    const messages = [
      messageWithTemp(0.6, 'person_a'),
      messageWithTemp(0.5, 'person_b'),
      messageWithTemp(0.4, 'person_a'),
      messageWithTemp(0.35, 'person_b'),
      messageWithTemp(0.35, 'person_a'),
      messageWithTemp(0.3, 'person_b'),
      messageWithTemp(0.3, 'person_a'),
      messageWithTemp(0.3, 'person_b'),
    ]
    const analysis = makeConflictAnalysis({
      emotionalTemperature: 0.25,
      meta: {
        contextMode: 'intimate',
        activeLenses: ['nvc'],
        primaryInsight: 'test',
        overallSeverity: 0.2,
        resolutionDirection: 'de-escalating',
      },
    })
    const result = checkForIntervention(messages, analysis)
    expect(result).toEqual({ shouldIntervene: true, type: 'resolution' })
  })

  it('does not trigger resolution with fewer than 8 human messages', () => {
    const messages = [
      messageWithTemp(0.3, 'person_a'),
      messageWithTemp(0.3, 'person_b'),
      messageWithTemp(0.3, 'person_a'),
    ]
    const analysis = makeConflictAnalysis({
      emotionalTemperature: 0.25,
      meta: {
        contextMode: 'intimate',
        activeLenses: ['nvc'],
        primaryInsight: 'test',
        overallSeverity: 0.2,
        resolutionDirection: 'de-escalating',
      },
    })
    const result = checkForIntervention(messages, analysis)
    expect(result.type).not.toBe('resolution')
  })

  it('resolution triggers with stable direction too', () => {
    const messages = [
      messageWithTemp(0.6, 'person_a'),
      messageWithTemp(0.5, 'person_b'),
      messageWithTemp(0.35, 'person_a'),
      messageWithTemp(0.3, 'person_b'),
      messageWithTemp(0.3, 'person_a'),
      messageWithTemp(0.3, 'person_b'),
      messageWithTemp(0.3, 'person_a'),
      messageWithTemp(0.3, 'person_b'),
    ]
    const analysis = makeConflictAnalysis({
      emotionalTemperature: 0.25,
      meta: {
        contextMode: 'intimate',
        activeLenses: ['nvc'],
        primaryInsight: 'test',
        overallSeverity: 0.2,
        resolutionDirection: 'stable',
      },
    })
    const result = checkForIntervention(messages, analysis)
    expect(result).toEqual({ shouldIntervene: true, type: 'resolution' })
  })
})
