export type SessionStatus = 'waiting' | 'active' | 'completed'
export type SessionMode = 'in_person' | 'remote'
export type MessageSender = 'person_a' | 'person_b' | 'mediator'

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

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          room_code: string
          person_a_name: string | null
          person_b_name: string | null
          status: SessionStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_code?: string
          person_a_name?: string | null
          person_b_name?: string | null
          status?: SessionStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_code?: string
          person_a_name?: string | null
          person_b_name?: string | null
          status?: SessionStatus
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
          nvc_analysis: NvcAnalysis | null
          emotional_temperature: number | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          sender: MessageSender
          content: string
          nvc_analysis?: NvcAnalysis | null
          emotional_temperature?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          sender?: MessageSender
          content?: string
          nvc_analysis?: NvcAnalysis | null
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

// Convenience types
export type Session = Database['public']['Tables']['sessions']['Row']
export type Message = Database['public']['Tables']['messages']['Row']

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
}
