import type {
  SignalType,
  SignalValue,
  AttachmentSignal,
  ConflictModeSignal,
  GottmanRiskSignal,
  RegulationSignal,
  ScarfSignal,
  DramaTriangleSignal,
  ValuesSignal,
  InterviewPhase,
} from '@/types/database'
import { stripCodeFences } from '@/lib/conversation'

interface ExtractedSignal {
  signal_type: SignalType
  signal_value: SignalValue
  confidence: number
}

interface PhaseExtraction {
  phase: InterviewPhase
  extracted: Record<string, unknown>
}

/**
 * Parse Claude's interview response to extract the JSON data block.
 * Returns null if no valid JSON found.
 */
export function parseInterviewExtraction(response: string): PhaseExtraction | null {
  // Find JSON block in response (between ```json and ```)
  const jsonMatch = response.match(/```json\s*([\s\S]*?)```/)
  if (!jsonMatch) return null

  try {
    return JSON.parse(stripCodeFences(jsonMatch[0])) as PhaseExtraction
  } catch {
    return null
  }
}

/**
 * Convert phase extraction data into typed behavioral signals.
 */
export function extractSignals(extraction: PhaseExtraction): ExtractedSignal[] {
  const signals: ExtractedSignal[] = []
  const data = extraction.extracted

  switch (extraction.phase) {
    case 2:
      if (data.attachment_style) {
        const att = data.attachment_style as { primary: string; confidence: number }
        signals.push({
          signal_type: 'attachment_style',
          signal_value: {
            primary: att.primary,
            confidence: att.confidence ?? 0.5,
          } as AttachmentSignal,
          confidence: att.confidence ?? 0.5,
        })
      }

      if (data.conflict_mode) {
        const cm = data.conflict_mode as {
          primary: string
          secondary?: string
          assertiveness: number
          cooperativeness: number
        }
        signals.push({
          signal_type: 'conflict_mode',
          signal_value: {
            primary: cm.primary,
            secondary: cm.secondary,
            assertiveness: cm.assertiveness ?? 0.5,
            cooperativeness: cm.cooperativeness ?? 0.5,
          } as ConflictModeSignal,
          confidence: 0.6,
        })
      }

      if (data.regulation_pattern) {
        const reg = data.regulation_pattern as {
          style: string
          flooding_onset: string
          trigger_sensitivity: number
        }
        signals.push({
          signal_type: 'regulation_pattern',
          signal_value: {
            style: reg.style,
            floodingOnset: reg.flooding_onset,
            triggerSensitivity: reg.trigger_sensitivity ?? 0.5,
          } as RegulationSignal,
          confidence: 0.55,
        })
      }
      break

    case 3:
      if (data.gottman_risk) {
        const gr = data.gottman_risk as { horsemen: string[]; repair_capacity: number }
        signals.push({
          signal_type: 'gottman_risk',
          signal_value: {
            horsemen: gr.horsemen ?? [],
            repairCapacity: gr.repair_capacity ?? 0.5,
          } as GottmanRiskSignal,
          confidence: 0.6,
        })
      }

      if (data.scarf_sensitivity) {
        const scarf = data.scarf_sensitivity as {
          primary_domain: string
          sensitivities: Record<string, number>
        }
        signals.push({
          signal_type: 'scarf_sensitivity',
          signal_value: {
            primaryDomain: scarf.primary_domain,
            sensitivities: scarf.sensitivities ?? {},
          } as ScarfSignal,
          confidence: 0.55,
        })
      }

      if (data.drama_triangle) {
        const dt = data.drama_triangle as {
          default_role: string | null
          rescuer_trap_risk: number
        }
        signals.push({
          signal_type: 'drama_triangle',
          signal_value: {
            defaultRole: dt.default_role,
            rescuerTrapRisk: dt.rescuer_trap_risk ?? 0.3,
          } as DramaTriangleSignal,
          confidence: 0.5,
        })
      }
      break

    case 4:
      if (data.values) {
        const vals = data.values as {
          core: string[]
          communication: string[]
          unmet_needs: string[]
        }
        signals.push({
          signal_type: 'values',
          signal_value: {
            core: vals.core ?? [],
            communication: vals.communication ?? [],
            unmetNeeds: vals.unmet_needs ?? [],
          } as ValuesSignal,
          confidence: 0.65,
        })
      }

      if (data.narrative_themes) {
        signals.push({
          signal_type: 'narrative_themes',
          signal_value: {
            themes: data.narrative_themes as string[],
            growthEdges: (data.growth_edges as string[]) ?? [],
            selfAwareness: (data.self_awareness_level as string) ?? 'moderate',
          },
          confidence: 0.6,
        })
      }
      break
  }

  return signals
}

/**
 * Check if Claude's response indicates phase completion.
 */
export function isPhaseComplete(response: string): boolean {
  return response.includes('[PHASE_COMPLETE]')
}

/**
 * Check if the interview is fully complete.
 */
export function isInterviewComplete(response: string): boolean {
  return response.includes('[INTERVIEW_COMPLETE]')
}

/**
 * Strip phase markers from the response for display.
 */
export function cleanResponseForDisplay(response: string): string {
  return response
    .replace(/\[PHASE_COMPLETE\]/g, '')
    .replace(/\[INTERVIEW_COMPLETE\]/g, '')
    .replace(/```json[\s\S]*?```/g, '')
    .trim()
}
