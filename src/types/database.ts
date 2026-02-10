export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SessionStatus = 'waiting' | 'active' | 'completed'
export type MessageSender = 'person_a' | 'person_b' | 'mediator'

export interface NvcAnalysis {
  observation: string
  feeling: string
  need: string
  request: string
  subtext: string
  translated_message: string
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
export type SessionInsert = Database['public']['Tables']['sessions']['Insert']
export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
