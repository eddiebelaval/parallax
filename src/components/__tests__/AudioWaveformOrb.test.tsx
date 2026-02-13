import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AudioWaveformOrb } from '../_deprecated/AudioWaveformOrb'

describe('AudioWaveformOrb', () => {
  it('renders the name label', () => {
    render(
      <AudioWaveformOrb name="Alice" role="a" waveform={null} energy={0} active={false} />
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders SVG elements', () => {
    const { container } = render(
      <AudioWaveformOrb name="Alice" role="a" waveform={null} energy={0} active={false} />
    )
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(2) // border ring + waveform
  })

  it('applies orb-idle class when not active', () => {
    const { container } = render(
      <AudioWaveformOrb name="Alice" role="a" waveform={null} energy={0} active={false} />
    )
    expect(container.querySelector('.orb-idle')).toBeInTheDocument()
  })

  it('removes orb-idle class when active', () => {
    const waveform = new Float32Array(1024).fill(0)
    const { container } = render(
      <AudioWaveformOrb name="Alice" role="a" waveform={waveform} energy={0.5} active={true} />
    )
    expect(container.querySelector('.orb-idle')).not.toBeInTheDocument()
  })

  it('renders waveform path from data when active', () => {
    const waveform = new Float32Array(1024)
    for (let i = 0; i < 1024; i++) waveform[i] = Math.sin(i / 50)

    const { container } = render(
      <AudioWaveformOrb name="Alice" role="a" waveform={waveform} energy={0.5} active={true} />
    )
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThanOrEqual(1)
    // Path should contain M and Q commands (bezier)
    const pathD = paths[0].getAttribute('d')
    expect(pathD).toContain('M')
    expect(pathD).toContain('Q')
  })

  it('uses correct default size of 64', () => {
    const { container } = render(
      <AudioWaveformOrb name="Alice" role="a" waveform={null} energy={0} active={false} />
    )
    const orbContainer = container.querySelector('[style]') as HTMLElement
    expect(orbContainer.style.width).toBe('64px')
    expect(orbContainer.style.height).toBe('64px')
  })

  it('respects custom size prop', () => {
    const { container } = render(
      <AudioWaveformOrb name="Alice" role="a" waveform={null} energy={0} active={false} size={100} />
    )
    const orbContainer = container.querySelector('[style]') as HTMLElement
    expect(orbContainer.style.width).toBe('100px')
    expect(orbContainer.style.height).toBe('100px')
  })
})
