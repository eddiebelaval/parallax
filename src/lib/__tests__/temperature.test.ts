import { describe, it, expect } from 'vitest'
import {
  getTemperatureColor,
  getTemperatureLabel,
  getBacklitClass,
  getAmbientClass,
} from '../temperature'

describe('getTemperatureColor', () => {
  it('returns neutral for 0.0', () => {
    expect(getTemperatureColor(0)).toBe('var(--temp-neutral)')
  })

  it('returns neutral for 0.1', () => {
    expect(getTemperatureColor(0.1)).toBe('var(--temp-neutral)')
  })

  it('returns cool for 0.2-0.4', () => {
    expect(getTemperatureColor(0.2)).toBe('var(--temp-cool)')
    expect(getTemperatureColor(0.4)).toBe('var(--temp-cool)')
  })

  it('returns warm for 0.5-0.7', () => {
    expect(getTemperatureColor(0.5)).toBe('var(--temp-warm)')
    expect(getTemperatureColor(0.7)).toBe('var(--temp-warm)')
  })

  it('returns hot for 0.8-1.0', () => {
    expect(getTemperatureColor(0.8)).toBe('var(--temp-hot)')
    expect(getTemperatureColor(1.0)).toBe('var(--temp-hot)')
  })
})

describe('getTemperatureLabel', () => {
  it('maps ranges to correct labels', () => {
    expect(getTemperatureLabel(0)).toBe('neutral')
    expect(getTemperatureLabel(0.1)).toBe('neutral')
    expect(getTemperatureLabel(0.3)).toBe('cool')
    expect(getTemperatureLabel(0.6)).toBe('warm')
    expect(getTemperatureLabel(0.9)).toBe('hot')
  })
})

describe('getBacklitClass', () => {
  it('returns empty string for neutral', () => {
    expect(getBacklitClass(0.05)).toBe('')
  })

  it('returns normal backlit class', () => {
    expect(getBacklitClass(0.3)).toBe('backlit backlit-cool')
    expect(getBacklitClass(0.6)).toBe('backlit backlit-warm')
    expect(getBacklitClass(0.9)).toBe('backlit backlit-hot')
  })

  it('returns strong variant when strong=true', () => {
    expect(getBacklitClass(0.3, true)).toBe('backlit backlit-cool-strong')
    expect(getBacklitClass(0.6, true)).toBe('backlit backlit-warm-strong')
    expect(getBacklitClass(0.9, true)).toBe('backlit backlit-hot-strong')
  })
})

describe('getAmbientClass', () => {
  it('returns empty string for neutral', () => {
    expect(getAmbientClass(0.05)).toBe('')
  })

  it('returns ambient glow class for non-neutral', () => {
    expect(getAmbientClass(0.3)).toBe('ambient-glow ambient-cool')
    expect(getAmbientClass(0.6)).toBe('ambient-glow ambient-warm')
    expect(getAmbientClass(0.9)).toBe('ambient-glow ambient-hot')
  })
})
