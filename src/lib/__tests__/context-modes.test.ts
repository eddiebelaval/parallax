import { describe, it, expect } from 'vitest'
import { CONTEXT_MODE_LENSES, LENS_METADATA, CONTEXT_MODE_INFO } from '../context-modes'
import type { ContextMode, LensId } from '@/types/database'

const ALL_CONTEXT_MODES: ContextMode[] = [
  'intimate',
  'family',
  'professional_peer',
  'professional_hierarchical',
  'transactional',
  'civil_structural',
]

const ALL_LENS_IDS: LensId[] = [
  'nvc', 'gottman', 'cbt', 'tki', 'dramaTriangle', 'narrative',
  'attachment', 'restorative', 'scarf', 'orgJustice', 'psychSafety',
  'jehns', 'power', 'ibr',
]

describe('CONTEXT_MODE_LENSES', () => {
  it('has an entry for every ContextMode', () => {
    for (const mode of ALL_CONTEXT_MODES) {
      expect(CONTEXT_MODE_LENSES[mode]).toBeDefined()
    }
  })

  it('every mode has a non-empty lens array', () => {
    for (const mode of ALL_CONTEXT_MODES) {
      expect(CONTEXT_MODE_LENSES[mode].length).toBeGreaterThan(0)
    }
  })

  it('NVC is always the first lens in every mode', () => {
    for (const mode of ALL_CONTEXT_MODES) {
      expect(CONTEXT_MODE_LENSES[mode][0]).toBe('nvc')
    }
  })

  it('no duplicate lenses in any mode', () => {
    for (const mode of ALL_CONTEXT_MODES) {
      const lenses = CONTEXT_MODE_LENSES[mode]
      const unique = new Set(lenses)
      expect(unique.size).toBe(lenses.length)
    }
  })

  it('every lens referenced in modes exists in ALL_LENS_IDS', () => {
    const validIds = new Set(ALL_LENS_IDS)
    for (const mode of ALL_CONTEXT_MODES) {
      for (const lens of CONTEXT_MODE_LENSES[mode]) {
        expect(validIds.has(lens)).toBe(true)
      }
    }
  })

  it('family mode has exactly 7 lenses', () => {
    expect(CONTEXT_MODE_LENSES.family).toHaveLength(7)
  })

  it('family mode has the expected lenses', () => {
    const expected: LensId[] = ['nvc', 'gottman', 'narrative', 'dramaTriangle', 'attachment', 'power', 'restorative']
    expect(CONTEXT_MODE_LENSES.family).toEqual(expected)
  })
})

describe('LENS_METADATA', () => {
  it('has an entry for every LensId', () => {
    for (const id of ALL_LENS_IDS) {
      expect(LENS_METADATA[id]).toBeDefined()
    }
  })

  it('every entry has required fields', () => {
    for (const id of ALL_LENS_IDS) {
      const meta = LENS_METADATA[id]
      expect(meta.name).toBeTruthy()
      expect(meta.shortName).toBeTruthy()
      expect(meta.category).toBeTruthy()
      expect(meta.description).toBeTruthy()
    }
  })

  it('categories are valid', () => {
    const validCategories = ['communication', 'relational', 'cognitive', 'systemic', 'resolution']
    for (const id of ALL_LENS_IDS) {
      expect(validCategories).toContain(LENS_METADATA[id].category)
    }
  })
})

describe('CONTEXT_MODE_INFO', () => {
  it('has an entry for every ContextMode', () => {
    for (const mode of ALL_CONTEXT_MODES) {
      expect(CONTEXT_MODE_INFO[mode]).toBeDefined()
    }
  })

  it('every entry has required fields', () => {
    for (const mode of ALL_CONTEXT_MODES) {
      const info = CONTEXT_MODE_INFO[mode]
      expect(info.name).toBeTruthy()
      expect(info.description).toBeTruthy()
      expect(info.example).toBeTruthy()
      expect(info.group).toBeTruthy()
    }
  })

  it('groups are valid', () => {
    const validGroups = ['personal', 'professional', 'formal']
    for (const mode of ALL_CONTEXT_MODES) {
      expect(validGroups).toContain(CONTEXT_MODE_INFO[mode].group)
    }
  })
})
