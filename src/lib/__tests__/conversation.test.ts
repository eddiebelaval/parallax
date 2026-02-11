import { describe, it, expect } from 'vitest'
import { buildNameMap, toConversationHistory, stripCodeFences } from '../conversation'
import type { MessageSender, Message } from '@/types/database'

describe('buildNameMap', () => {
  it('uses provided names', () => {
    const map = buildNameMap({ person_a_name: 'Alice', person_b_name: 'Bob' })
    expect(map).toEqual({
      person_a: 'Alice',
      person_b: 'Bob',
      mediator: 'Claude',
    })
  })

  it('falls back to defaults when names are null', () => {
    const map = buildNameMap({ person_a_name: null, person_b_name: null })
    expect(map).toEqual({
      person_a: 'Person A',
      person_b: 'Person B',
      mediator: 'Claude',
    })
  })

  it('handles mixed null and provided names', () => {
    const map = buildNameMap({ person_a_name: 'Alice', person_b_name: null })
    expect(map.person_a).toBe('Alice')
    expect(map.person_b).toBe('Person B')
  })
})

describe('toConversationHistory', () => {
  it('maps messages to conversation entries using name map', () => {
    const nameMap: Record<MessageSender, string> = {
      person_a: 'Alice',
      person_b: 'Bob',
      mediator: 'Claude',
    }
    const messages = [
      { sender: 'person_a' as MessageSender, content: 'Hello' },
      { sender: 'person_b' as MessageSender, content: 'Hi there' },
      { sender: 'mediator' as MessageSender, content: 'Welcome' },
    ] as Message[]

    const history = toConversationHistory(messages, nameMap)
    expect(history).toEqual([
      { sender: 'Alice', content: 'Hello' },
      { sender: 'Bob', content: 'Hi there' },
      { sender: 'Claude', content: 'Welcome' },
    ])
  })

  it('returns empty array for empty messages', () => {
    const nameMap: Record<MessageSender, string> = {
      person_a: 'A',
      person_b: 'B',
      mediator: 'Claude',
    }
    expect(toConversationHistory([], nameMap)).toEqual([])
  })
})

describe('stripCodeFences', () => {
  it('strips json code fences', () => {
    const input = '```json\n{"key": "value"}\n```'
    expect(stripCodeFences(input)).toBe('{"key": "value"}')
  })

  it('strips plain code fences', () => {
    const input = '```\n{"key": "value"}\n```'
    expect(stripCodeFences(input)).toBe('{"key": "value"}')
  })

  it('returns plain text unchanged', () => {
    const input = '{"key": "value"}'
    expect(stripCodeFences(input)).toBe('{"key": "value"}')
  })

  it('trims whitespace', () => {
    const input = '  \n {"key": "value"}  \n '
    expect(stripCodeFences(input)).toBe('{"key": "value"}')
  })
})
