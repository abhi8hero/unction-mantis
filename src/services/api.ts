import { supabase } from '@/db/supabase';
import type { Session, Message } from '@/types/types';

// Visitor ID management
export function getOrCreateVisitorId(): string {
  const stored = localStorage.getItem('twin_ai_visitor_id');
  if (stored) return stored;
  const newId = crypto.randomUUID();
  localStorage.setItem('twin_ai_visitor_id', newId);
  return newId;
}

// Session management
export async function createSession(visitorId: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      visitor_id: visitorId,
      channel: 'text',
      status: 'active',
      title: 'New Conversation',
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating session:', error);
    return null;
  }
  return data as Session;
}

export async function updateSessionTitle(
  sessionId: string,
  title: string
): Promise<void> {
  await supabase.from('sessions').update({ title }).eq('session_id', sessionId);
}

export async function completeSession(sessionId: string): Promise<void> {
  await supabase
    .from('sessions')
    .update({ status: 'completed', end_time: new Date().toISOString() })
    .eq('session_id', sessionId);
}

export async function getVisitorSessions(
  visitorId: string,
  limit = 20
): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('visitor_id', visitorId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
  return Array.isArray(data) ? (data as Session[]) : [];
}

// Message management
export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true })
    .limit(200);

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  return Array.isArray(data) ? (data as Message[]) : [];
}
