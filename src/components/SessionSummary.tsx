'use client'

import { useState, useEffect } from 'react'
import type { SessionSummaryData } from '@/types/database'

interface SessionSummaryProps {
  roomCode: string
  personAName: string
  personBName: string
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: SessionSummaryData }

export function SessionSummary({ roomCode, personAName, personBName }: SessionSummaryProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function fetchSummary() {
      try {
        const res = await fetch(`/api/sessions/${roomCode}/summary`, {
          method: 'POST',
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: 'Failed to generate summary' }))
          if (!cancelled) setState({ status: 'error', message: body.error })
          return
        }
        const { summary } = await res.json()
        if (!cancelled) setState({ status: 'ready', data: summary })
      } catch {
        if (!cancelled) setState({ status: 'error', message: 'Network error' })
      }
    }

    fetchSummary()
    return () => { cancelled = true }
  }, [roomCode])

  if (state.status === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <p className="font-mono text-xs uppercase tracking-wider text-factory-gray-500">
          Generating summary...
        </p>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
        <p className="font-mono text-xs uppercase tracking-wider text-red-400">
          Failed to generate summary
        </p>
        <p className="text-factory-gray-500 text-sm text-center">{state.message}</p>
      </div>
    )
  }

  const { data } = state

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto space-y-8 sm:space-y-10">
        {/* Overall Insight — hero quote */}
        <div className="border-l-2 border-accent pl-5 py-2">
          <p className="text-foreground text-lg leading-relaxed">
            {data.overallInsight}
          </p>
        </div>

        {/* Temperature Arc */}
        <SummarySection label="Temperature Arc">
          <p className="text-factory-gray-300 text-sm leading-relaxed">
            {data.temperatureArc}
          </p>
        </SummarySection>

        {/* Key Moments */}
        {data.keyMoments.length > 0 && (
          <SummarySection label="Key Moments">
            <ul className="space-y-2">
              {data.keyMoments.map((moment, i) => (
                <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-factory-gray-300">
                  <span className="mt-1.5 block w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  {moment}
                </li>
              ))}
            </ul>
          </SummarySection>
        )}

        {/* Person sections — side by side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <PersonSummary
            name={personAName}
            needs={data.personANeeds}
            takeaway={data.personATakeaway}
            strength={data.personAStrength}
          />
          <PersonSummary
            name={personBName}
            needs={data.personBNeeds}
            takeaway={data.personBTakeaway}
            strength={data.personBStrength}
          />
        </div>
      </div>
    </div>
  )
}

function SummarySection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-factory-gray-600 mb-3">
        {label}
      </p>
      {children}
    </div>
  )
}

function PersonSummary({
  name,
  needs,
  takeaway,
  strength,
}: {
  name: string
  needs: string
  takeaway: string
  strength: string
}) {
  return (
    <div className="space-y-5">
      <p className="font-mono text-xs uppercase tracking-wider text-accent">
        {name}
      </p>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-factory-gray-600 mb-1.5">
          What they needed
        </p>
        <p className="text-factory-gray-300 text-sm leading-relaxed">{needs}</p>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-factory-gray-600 mb-1.5">
          Takeaway
        </p>
        <p className="text-factory-gray-300 text-sm leading-relaxed">{takeaway}</p>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-factory-gray-600 mb-1.5">
          What they did well
        </p>
        <p className="text-success text-sm leading-relaxed">{strength}</p>
      </div>
    </div>
  )
}
