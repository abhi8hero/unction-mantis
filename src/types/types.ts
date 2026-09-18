export interface Session {
  session_id: string;
  visitor_id: string;
  start_time: string;
  end_time?: string;
  channel: 'text' | 'voice';
  message_count: number;
  title?: string;
  status: 'active' | 'completed';
  created_at: string;
}

export interface Message {
  message_id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  message_type: 'text' | 'voice';
  privacy_classification: 'public' | 'private' | 'confidential';
  created_at: string;
}

// Client-side chat message (includes streaming state)
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface LLMContentPart {
  text: string;
}

export interface LLMContentMessage {
  role: 'user' | 'model';
  parts: LLMContentPart[];
}
