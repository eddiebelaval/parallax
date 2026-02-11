import { describe, it, expect } from 'vitest'
import { generateRoomCode, isValidRoomCode } from '../room-code'

describe('generateRoomCode', () => {
  it('generates a 6-character string', () => {
    const code = generateRoomCode()
    expect(code).toHaveLength(6)
  })

  it('only uses allowed characters (no O, 0, 1, I)', () => {
    const allowed = /^[A-HJ-NP-Z2-9]+$/
    for (let i = 0; i < 50; i++) {
      expect(generateRoomCode()).toMatch(allowed)
    }
  })

  it('generates unique codes', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateRoomCode()))
    expect(codes.size).toBeGreaterThan(90)
  })
})

describe('isValidRoomCode', () => {
  it('accepts valid 6-char codes', () => {
    expect(isValidRoomCode('ABC234')).toBe(true)
    expect(isValidRoomCode('XYZWVK')).toBe(true)
  })

  it('accepts lowercase (converts internally)', () => {
    expect(isValidRoomCode('abc234')).toBe(true)
  })

  it('rejects codes with ambiguous characters', () => {
    expect(isValidRoomCode('ABCDO0')).toBe(false) // O and 0
    expect(isValidRoomCode('ABCD1I')).toBe(false) // 1 and I
  })

  it('rejects wrong length', () => {
    expect(isValidRoomCode('ABC23')).toBe(false)
    expect(isValidRoomCode('ABC2345')).toBe(false)
    expect(isValidRoomCode('')).toBe(false)
  })
})
