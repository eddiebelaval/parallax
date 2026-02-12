// Conversational Layer — types for the two-tier voice system
// Explorer (judge/dev-facing, read-only) and Guide (user-facing, agentic)

export type ConversationalMode = 'explorer' | 'guide'

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  toolResults?: ToolResult[]
}

export interface ToolResult {
  toolName: string
  input: Record<string, unknown>
  output: string
  success: boolean
}

export interface ConverseRequest {
  mode: ConversationalMode
  message: string
  history: ConversationMessage[]
}

export interface ConverseResponse {
  message: string
  toolResults?: ToolResult[]
}

export interface ConversePanelProps {
  mode: ConversationalMode
  isOpen: boolean
  onClose: () => void
}
