import { describe, it, expect } from 'vitest'
import {
  buildGreetingPrompt,
  buildAcknowledgeAPrompt,
  buildSynthesisPrompt,
  buildAdaptivePrompt,
  buildInterventionPrompt,
} from '../prompts/conductor'

describe('buildGreetingPrompt', () => {
  it('returns non-empty system and user strings', () => {
    const { system, user } = buildGreetingPrompt('Alice', 'Bob', 'intimate')
    expect(system.length).toBeGreaterThan(0)
    expect(user.length).toBeGreaterThan(0)
  })

  it('includes person names in user prompt', () => {
    const { user } = buildGreetingPrompt('Alice', 'Bob', 'intimate')
    expect(user).toContain('Alice')
    expect(user).toContain('Bob')
  })

  it('includes context mode in user prompt', () => {
    const { user } = buildGreetingPrompt('Alice', 'Bob', 'professional_peer')
    expect(user).toContain('professional peer')
  })
})

describe('buildAcknowledgeAPrompt', () => {
  it('returns non-empty system and user strings', () => {
    const { system, user } = buildAcknowledgeAPrompt('Alice', 'Bob', 'I feel unheard')
    expect(system.length).toBeGreaterThan(0)
    expect(user.length).toBeGreaterThan(0)
  })

  it('includes person names and context', () => {
    const { user } = buildAcknowledgeAPrompt('Alice', 'Bob', 'We never talk anymore')
    expect(user).toContain('Alice')
    expect(user).toContain('Bob')
    expect(user).toContain('We never talk anymore')
  })
})

describe('buildSynthesisPrompt', () => {
  it('returns non-empty system and user strings', () => {
    const { system, user } = buildSynthesisPrompt(
      'Alice', 'Bob', 'I feel unheard', 'I feel overwhelmed', 'intimate'
    )
    expect(system.length).toBeGreaterThan(0)
    expect(user.length).toBeGreaterThan(0)
  })

  it('includes both perspectives in user prompt', () => {
    const { user } = buildSynthesisPrompt(
      'Alice', 'Bob', 'I feel unheard', 'I feel overwhelmed', 'family'
    )
    expect(user).toContain('I feel unheard')
    expect(user).toContain('I feel overwhelmed')
  })

  it('includes JSON schema instruction in system prompt', () => {
    const { system } = buildSynthesisPrompt(
      'Alice', 'Bob', 'ctx a', 'ctx b', 'intimate'
    )
    expect(system).toContain('JSON')
    expect(system).toContain('goals')
  })

  it('includes context mode in user prompt', () => {
    const { user } = buildSynthesisPrompt(
      'Alice', 'Bob', 'ctx a', 'ctx b', 'professional_hierarchical'
    )
    expect(user).toContain('professional hierarchical')
  })
})

describe('buildAdaptivePrompt', () => {
  it('returns non-empty system and user strings with no messages', () => {
    const { system, user } = buildAdaptivePrompt([], 'intimate')
    expect(system.length).toBeGreaterThan(0)
    expect(user.length).toBeGreaterThan(0)
  })

  it('includes conversation history in user prompt', () => {
    const messages = [
      { sender: 'person_a', content: 'Hello' },
      { sender: 'person_b', content: 'Hi there' },
    ]
    const { user } = buildAdaptivePrompt(messages, 'intimate')
    expect(user).toContain('[person_a]: Hello')
    expect(user).toContain('[person_b]: Hi there')
  })

  it('includes context mode in system prompt', () => {
    const { system } = buildAdaptivePrompt([], 'transactional')
    expect(system).toContain('transactional')
  })

  it('shows fallback text when no messages', () => {
    const { user } = buildAdaptivePrompt([], 'intimate')
    expect(user).toContain('No messages yet')
  })
})

describe('buildInterventionPrompt', () => {
  const recentMessages = [
    { sender: 'Alice', content: 'You never listen!' },
    { sender: 'Bob', content: 'That is not true!' },
  ]
  const goals = ['Improve communication', 'Find compromise']

  it('returns non-empty system and user strings', () => {
    const { system, user } = buildInterventionPrompt(
      'Alice', 'Bob', recentMessages, 'escalation', goals, 'intimate'
    )
    expect(system.length).toBeGreaterThan(0)
    expect(user.length).toBeGreaterThan(0)
  })

  it('includes person names in user prompt', () => {
    const { user } = buildInterventionPrompt(
      'Alice', 'Bob', recentMessages, 'escalation', goals, 'intimate'
    )
    expect(user).toContain('Alice')
    expect(user).toContain('Bob')
  })

  it('includes session goals in user prompt', () => {
    const { user } = buildInterventionPrompt(
      'Alice', 'Bob', recentMessages, 'escalation', goals, 'intimate'
    )
    expect(user).toContain('Improve communication')
    expect(user).toContain('Find compromise')
  })

  it('includes intervention type instructions for escalation', () => {
    const { user } = buildInterventionPrompt(
      'Alice', 'Bob', recentMessages, 'escalation', goals, 'intimate'
    )
    expect(user).toContain('escalating')
  })

  it('includes intervention type instructions for dominance', () => {
    const { user } = buildInterventionPrompt(
      'Alice', 'Bob', recentMessages, 'dominance', goals, 'intimate'
    )
    expect(user).toContain('dominating')
  })

  it('includes intervention type instructions for breakthrough', () => {
    const { user } = buildInterventionPrompt(
      'Alice', 'Bob', recentMessages, 'breakthrough', goals, 'intimate'
    )
    expect(user).toContain('positive')
  })

  it('includes intervention type instructions for resolution', () => {
    const { user } = buildInterventionPrompt(
      'Alice', 'Bob', recentMessages, 'resolution', goals, 'intimate'
    )
    expect(user).toContain('natural conclusion')
  })

  it('includes recent messages in user prompt', () => {
    const { user } = buildInterventionPrompt(
      'Alice', 'Bob', recentMessages, 'escalation', goals, 'intimate'
    )
    expect(user).toContain('You never listen!')
    expect(user).toContain('That is not true!')
  })
})
