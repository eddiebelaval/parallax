export type SessionStatus = 'waiting' | 'active' | 'completed'
export type SessionMode = 'remote' | 'in_person'
export type OnboardingStep = 'introductions' | 'set_stage' | 'set_goals' | 'complete'
export type MessageSender = 'person_a' | 'person_b' | 'mediator'
export type IssueStatus = 'unaddressed' | 'well_addressed' | 'poorly_addressed' | 'deferred'

// V3: Context modes — determines which lenses activate
export type ContextMode =
  | 'intimate'
  | 'family'
  | 'professional_peer'
  | 'professional_hierarchical'
  | 'transactional'
  | 'civil_structural'

// V3: 14 analytical lenses
export type LensId =
  | 'nvc'
  | 'gottman'
  | 'cbt'
  | 'tki'
  | 'dramaTriangle'
  | 'narrative'
  | 'attachment'
  | 'restorative'
  | 'scarf'
  | 'orgJustice'
  | 'psychSafety'
  | 'jehns'
  | 'power'
  | 'ibr'

// V1 NVC analysis — preserved at root for backward compat
export interface NvcAnalysis {
  // Classic NVC framework (Marshall Rosenberg's 4 components)
  observation: string       // What happened — fact without judgment
  feeling: string           // What the speaker is feeling
  need: string              // The core human need behind the feeling
  request: string           // A constructive ask they could make

  // "Beneath the surface" analysis (Parallax's unique lens)
  subtext: string           // What they're really saying beneath the words
  blindSpots: string[]      // What the speaker can't see about their own communication
  unmetNeeds: string[]      // Structured list of unmet universal human needs
  nvcTranslation: string    // The message rewritten using NVC principles
  emotionalTemperature: number // 0.0 (calm/neutral) to 1.0 (heated/volatile)
}

// V3: Per-lens result interfaces
export interface GottmanResult {
  horsemen: Array<{ type: 'criticism' | 'contempt' | 'defensiveness' | 'stonewalling'; evidence: string }>
  repairAttempts: string[]
  positiveToNegativeRatio: string
  startupType: 'harsh' | 'soft' | 'neutral'
}

export interface CbtResult {
  distortions: Array<{ type: string; evidence: string }>
  coreBeliefHint: string
}

export interface TkiResult {
  mode: 'competing' | 'collaborating' | 'compromising' | 'avoiding' | 'accommodating'
  assertiveness: number // 0-1
  cooperativeness: number // 0-1
  modeShift: string | null
}

export interface DramaTriangleResult {
  role: 'persecutor' | 'victim' | 'rescuer' | null
  roleShifts: string[]
  rescuerTrap: boolean
}

export interface NarrativeResult {
  totalizingNarratives: string[]
  identityClaims: string[]
  reauthoringSuggestion: string
}

export interface AttachmentResult {
  style: 'secure' | 'anxious' | 'avoidant' | 'disorganized'
  pursueWithdrawDynamic: boolean
  activationSignal: string
}

export interface RestorativeResult {
  harmIdentified: string
  needsOfHarmed: string[]
  needsOfHarmer: string[]
  repairPathway: string
}

export interface ScarfResult {
  threats: Array<{ domain: 'status' | 'certainty' | 'autonomy' | 'relatedness' | 'fairness'; severity: number }>
  primaryThreat: string
}

export interface OrgJusticeResult {
  justiceType: 'distributive' | 'procedural' | 'interactional' | null
  perceivedViolation: string
  fairnessFrame: string
}

export interface PsychSafetyResult {
  safetyLevel: 'high' | 'moderate' | 'low'
  riskSignals: string[]
  silencedTopics: string[]
}

export interface JehnsResult {
  conflictType: 'task' | 'relationship' | 'process'
  escalationRisk: 'low' | 'moderate' | 'high'
  taskToRelationshipSpillover: boolean
}

export interface PowerResult {
  powerDynamic: 'symmetric' | 'asymmetric'
  powerMoves: string[]
  silencingPatterns: string[]
}

export interface IbrResult {
  interests: string[]
  positions: string[]
  interestBehindPosition: string
  commonGround: string | null
}

// V3: Composite lens results
export interface LensResults {
  nvc?: NvcAnalysis
  gottman?: GottmanResult | null
  cbt?: CbtResult | null
  tki?: TkiResult | null
  dramaTriangle?: DramaTriangleResult | null
  narrative?: NarrativeResult | null
  attachment?: AttachmentResult | null
  restorative?: RestorativeResult | null
  scarf?: ScarfResult | null
  orgJustice?: OrgJusticeResult | null
  psychSafety?: PsychSafetyResult | null
  jehns?: JehnsResult | null
  power?: PowerResult | null
  ibr?: IbrResult | null
}

// V3: Analysis metadata
export interface AnalysisMeta {
  contextMode: ContextMode
  activeLenses: LensId[]
  primaryInsight: string
  overallSeverity: number // 0.0-1.0
  resolutionDirection: 'escalating' | 'stable' | 'de-escalating'
}

// V3: Full conflict analysis — extends NvcAnalysis at root for backward compat
export interface ConflictAnalysis extends NvcAnalysis {
  lenses: LensResults
  meta: AnalysisMeta
}

export type ConductorPhase =
  | 'onboarding'    // Adaptive in-person onboarding (Claude drives everything)
  | 'greeting'      // Mediator sends welcome (remote mode)
  | 'gather_a'      // Waiting for Person A context (remote mode)
  | 'waiting_for_b' // Person A shared, waiting for Person B to arrive
  | 'gather_b'      // Waiting for Person B context (remote mode)
  | 'synthesize'    // Mediator synthesizes + sets goals (remote mode)
  | 'active'        // Normal conversation with interventions

export interface OnboardingContext {
  // Existing fields (in-person mode)
  stageDescription?: string
  goals?: string[]
  // Conductor fields (remote mode)
  conductorPhase?: ConductorPhase
  personAContext?: string      // What Person A shared
  personBContext?: string      // What Person B shared
  sessionGoals?: string[]      // Goals proposed by mediator
  contextSummary?: string      // Mediator's synthesis
}

export interface CoachingMessage {
  id: string
  session_id: string
  person: 'person_a' | 'person_b'
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          room_code: string
          person_a_name: string | null
          person_b_name: string | null
          person_a_user_id: string | null
          person_b_user_id: string | null
          status: SessionStatus
          mode: SessionMode
          context_mode: ContextMode
          onboarding_step: OnboardingStep | null
          onboarding_context: OnboardingContext | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_code?: string
          person_a_name?: string | null
          person_b_name?: string | null
          person_a_user_id?: string | null
          person_b_user_id?: string | null
          status?: SessionStatus
          mode?: SessionMode
          context_mode?: ContextMode
          onboarding_step?: OnboardingStep | null
          onboarding_context?: OnboardingContext | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_code?: string
          person_a_name?: string | null
          person_b_name?: string | null
          person_a_user_id?: string | null
          person_b_user_id?: string | null
          status?: SessionStatus
          mode?: SessionMode
          context_mode?: ContextMode
          onboarding_step?: OnboardingStep | null
          onboarding_context?: OnboardingContext | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          session_id: string
          sender: MessageSender
          content: string
          nvc_analysis: NvcAnalysis | ConflictAnalysis | null
          emotional_temperature: number | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          sender: MessageSender
          content: string
          nvc_analysis?: NvcAnalysis | ConflictAnalysis | null
          emotional_temperature?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          sender?: MessageSender
          content?: string
          nvc_analysis?: NvcAnalysis | ConflictAnalysis | null
          emotional_temperature?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'messages_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'sessions'
            referencedColumns: ['id']
          }
        ]
      }
      issues: {
        Row: {
          id: string
          session_id: string
          raised_by: 'person_a' | 'person_b'
          source_message_id: string
          label: string
          description: string
          status: IssueStatus
          addressed_by_message_id: string | null
          grading_rationale: string | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          raised_by: 'person_a' | 'person_b'
          source_message_id: string
          label: string
          description: string
          status?: IssueStatus
          addressed_by_message_id?: string | null
          grading_rationale?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          raised_by?: 'person_a' | 'person_b'
          source_message_id?: string
          label?: string
          description?: string
          status?: IssueStatus
          addressed_by_message_id?: string | null
          grading_rationale?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'issues_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'sessions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'issues_source_message_id_fkey'
            columns: ['source_message_id']
            isOneToOne: false
            referencedRelation: 'messages'
            referencedColumns: ['id']
          }
        ]
      }
      coaching_messages: {
        Row: {
          id: string
          session_id: string
          person: 'person_a' | 'person_b'
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          person: 'person_a' | 'person_b'
          role: 'user' | 'assistant'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          person?: 'person_a' | 'person_b'
          role?: 'user' | 'assistant'
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'coaching_messages_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'sessions'
            referencedColumns: ['id']
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          interview_completed: boolean
          interview_phase: number
          interview_started_at: string | null
          interview_completed_at: string | null
          raw_responses: unknown[]
          primary_context_mode: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          interview_completed?: boolean
          interview_phase?: number
          interview_started_at?: string | null
          interview_completed_at?: string | null
          raw_responses?: unknown[]
          primary_context_mode?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          interview_completed?: boolean
          interview_phase?: number
          interview_started_at?: string | null
          interview_completed_at?: string | null
          raw_responses?: unknown[]
          primary_context_mode?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      behavioral_signals: {
        Row: {
          id: string
          user_id: string
          signal_type: string
          signal_value: Record<string, unknown>
          confidence: number
          source: string
          extracted_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          signal_type: string
          signal_value: Record<string, unknown>
          confidence?: number
          source?: string
          extracted_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          signal_type?: string
          signal_value?: Record<string, unknown>
          confidence?: number
          source?: string
          extracted_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      signal_consent: {
        Row: {
          id: string
          session_id: string
          user_id: string
          consent_level: string
          granted_at: string
          revoked_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          consent_level?: string
          granted_at?: string
          revoked_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          consent_level?: string
          granted_at?: string
          revoked_at?: string | null
        }
        Relationships: []
      }
      signal_access_log: {
        Row: {
          id: string
          signal_owner_id: string
          accessor_session_id: string
          signal_type: string
          consent_level: string
          accessed_at: string
        }
        Insert: {
          id?: string
          signal_owner_id: string
          accessor_session_id: string
          signal_type: string
          consent_level: string
          accessed_at?: string
        }
        Update: {
          id?: string
          signal_owner_id?: string
          accessor_session_id?: string
          signal_type?: string
          consent_level?: string
          accessed_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      generate_room_code: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// ────────────────────────────────────────────────
// Intelligence Network types
// ────────────────────────────────────────────────

export type SignalType =
  | 'attachment_style'
  | 'conflict_mode'
  | 'gottman_risk'
  | 'regulation_pattern'
  | 'scarf_sensitivity'
  | 'drama_triangle'
  | 'values'
  | 'cbt_patterns'
  | 'narrative_themes'

export type ConsentLevel = 'self_only' | 'anonymous_signals'

export type InterviewPhase = 0 | 1 | 2 | 3 | 4

export interface AttachmentSignal {
  primary: 'secure' | 'anxious' | 'avoidant' | 'disorganized'
  secondary?: 'secure' | 'anxious' | 'avoidant' | 'disorganized'
  confidence: number
}

export interface ConflictModeSignal {
  primary: 'competing' | 'collaborating' | 'compromising' | 'avoiding' | 'accommodating'
  secondary?: 'competing' | 'collaborating' | 'compromising' | 'avoiding' | 'accommodating'
  assertiveness: number
  cooperativeness: number
}

export interface GottmanRiskSignal {
  horsemen: Array<'criticism' | 'contempt' | 'defensiveness' | 'stonewalling'>
  repairCapacity: number
}

export interface RegulationSignal {
  style: 'regulated' | 'dysregulated' | 'over_regulated'
  floodingOnset: string
  triggerSensitivity: number
}

export interface ScarfSignal {
  primaryDomain: 'status' | 'certainty' | 'autonomy' | 'relatedness' | 'fairness'
  sensitivities: Record<string, number>
}

export interface DramaTriangleSignal {
  defaultRole: 'persecutor' | 'victim' | 'rescuer' | null
  rescuerTrapRisk: number
}

export interface ValuesSignal {
  core: string[]
  communication: string[]
  unmetNeeds: string[]
}

export type SignalValue =
  | AttachmentSignal
  | ConflictModeSignal
  | GottmanRiskSignal
  | RegulationSignal
  | ScarfSignal
  | DramaTriangleSignal
  | ValuesSignal
  | Record<string, unknown>

export interface UserProfile {
  id: string
  user_id: string
  display_name: string | null
  interview_completed: boolean
  interview_phase: InterviewPhase
  interview_started_at: string | null
  interview_completed_at: string | null
  raw_responses: unknown[]
  primary_context_mode: ContextMode
  created_at: string
  updated_at: string
}

export interface BehavioralSignal {
  id: string
  user_id: string
  signal_type: SignalType
  signal_value: SignalValue
  confidence: number
  source: 'interview' | 'session_observation' | 'self_update'
  extracted_at: string
  updated_at: string
}

export interface SignalConsent {
  id: string
  session_id: string
  user_id: string
  consent_level: ConsentLevel
  granted_at: string
  revoked_at: string | null
}

export interface SignalAccessLog {
  id: string
  signal_owner_id: string
  accessor_session_id: string
  signal_type: string
  consent_level: ConsentLevel
  accessed_at: string
}

// Convenience types
export type Session = Database['public']['Tables']['sessions']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Issue = Database['public']['Tables']['issues']['Row']

// Type guard: check if an analysis is V3 ConflictAnalysis
export function isConflictAnalysis(analysis: NvcAnalysis | ConflictAnalysis): analysis is ConflictAnalysis {
  return 'lenses' in analysis && 'meta' in analysis
}

export interface SessionSummaryData {
  temperatureArc: string
  keyMoments: string[]
  personANeeds: string
  personBNeeds: string
  personATakeaway: string
  personBTakeaway: string
  personAStrength: string
  personBStrength: string
  overallInsight: string
  // V3: Lens-aware summary fields
  lensInsights: string[]
  resolutionTrajectory: string
}
