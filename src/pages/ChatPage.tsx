import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { ChatHeader } from '@/components/ChatHeader';
import { MessageBubble } from '@/components/MessageBubble';
import { ChatInput } from '@/components/ChatInput';
import { SuggestionChips } from '@/components/SuggestionChips';
// import { ConversationHistory } from '@/components/ConversationHistory';
import { ProfilePanel } from '@/components/ProfilePanel';
import { TwinAvatar } from '@/components/TwinAvatar';
import {
  getOrCreateVisitorId,
  createSession,
  updateSessionTitle,
} from '@/services/api';
import { sendStreamRequest } from '@/lib/sse';
import type { ChatMessage, LLMContentMessage } from '@/types/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  // const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  // const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [visitorId] = useState(() => getOrCreateVisitorId());

  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyTitleSet = useRef(false);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load visitor sessions on mount
  {/* useEffect(() => {
    loadSessions();
  }, [visitorId]);

  const loadSessions = useCallback(async () => {
    const data = await getVisitorSessions(visitorId);
    setSessions(data);
  }, [visitorId]); */}

  // Start a new session
  {/* const startNewSession = useCallback(async () => {
    historyTitleSet.current = false;
    setMessages([]);
    setCurrentSessionId(null);
    setShowHistory(false);
  }, []); */}

  // Load an existing session
  {/* const loadSession = useCallback(async (sessionId: string) => {
    setIsLoadingHistory(true);
    setCurrentSessionId(sessionId);
    setShowHistory(false);
    historyTitleSet.current = true;

    const msgs = await getSessionMessages(sessionId);
    const chatMessages: ChatMessage[] = msgs.map((m) => ({
      id: m.message_id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      timestamp: new Date(m.timestamp),
    }));
    setMessages(chatMessages);
    setIsLoadingHistory(false);
  }, []); */}

  // Build conversation history for LLM context (last 10 exchanges = 20 messages)
  const buildLLMHistory = (msgs: ChatMessage[]): LLMContentMessage[] => {
    const recent = msgs.slice(-20);
    return recent.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));
  };

  // Send a message
  const handleSend = useCallback(
    async (text: string) => {
      if (isStreaming) return;

      let sessionId = currentSessionId;

      // Create session if needed
      if (!sessionId) {
        const session = await createSession(visitorId);
        if (!session) {
          toast.error('Failed to start conversation. Please try again.');
          return;
        }
        sessionId = session.session_id;
        setCurrentSessionId(sessionId);
        // setSessions((prev) => [session, ...prev]);
      }

      // Add user message to UI
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);

      // Auto-set session title from first message
      if (!historyTitleSet.current) {
        historyTitleSet.current = true;
        const title = text.length > 48 ? text.slice(0, 45) + '…' : text;
        await updateSessionTitle(sessionId, title);
        {/* setSessions((prev) =>
          prev.map((s) => (s.session_id === sessionId ? { ...s, title } : s)) 
        );*/}
      }

      // Add streaming assistant placeholder
      const assistantMsgId = crypto.randomUUID();
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsStreaming(true);

      abortRef.current = new AbortController();

      await sendStreamRequest({
        functionUrl: `${SUPABASE_URL}/functions/v1/twin-ai-chat`,
        requestBody: {
          session_id: sessionId,
          message: text,
          conversation_history: buildLLMHistory(messages),
        },
        supabaseAnonKey: SUPABASE_PUBLISHABLE_KEY,
        onData: (data) => {
          try {
            const parsed = JSON.parse(data);
            const chunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            if (chunk) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m
                )
              );
            }
          } catch {
            /* skip incomplete frames */
          }
        },
        onComplete: () => {
          setIsStreaming(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, isStreaming: false } : m
            )
          );
        },
        onError: (err) => {
          setIsStreaming(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    isStreaming: false,
                    content:
                      m.content ||
                      "I'm having a moment of technical difficulty. Please try sending your message again.",
                  }
                : m
            )
          );
          if (!abortRef.current?.signal.aborted) {
            toast.error('Connection issue. Please try again.');
            console.error('Stream error:', err);
          }
        },
        signal: abortRef.current.signal,
      });
    },
    [isStreaming, currentSessionId, messages, visitorId]
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
  }, []);

  const showSuggestions = messages.length === 0;

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: 'var(--gradient-background, hsl(var(--background)))' }}
    >
      {/* ─── Desktop sidebar: Conversation History ─── */}
     {/* <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
        <ConversationHistory
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={loadSession}
          onNewSession={startNewSession}
          onClose={() => setShowHistory(false)}
        />
      </aside> */}

      {/* ─── Main Chat Area ─── */}
      <div className="flex flex-1 min-w-0 flex-col">
        <ChatHeader
          // onToggleHistory={() => setShowHistory(true)}
          onToggleProfile={() => setShowProfile(true)}
          showProfileToggle={true}
        />

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
            {/* Welcome screen */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col items-center gap-5 py-8 text-center"
                >
                  <div className="spotlight">
                    <TwinAvatar size="lg" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">Hi, I'm Twin AI</h1>
                    <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                      Abhishek's professional digital twin. Ask me about his skills,
                      projects, education, or career interests.
                    </p>
                  </div>
                  <div className="hairline-pink w-24" />
                  <SuggestionChips onSelect={handleSend} disabled={isStreaming} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading history */}
           {/* {isLoadingHistory && (
              <div className="flex justify-center py-10">
                <span className="inline-flex gap-1.5 items-center text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
                  Loading conversation…
                </span>
              </div>
            )} */}

            {/* Messages */}
            {messages.map((msg, i) => (
              <MessageBubble key={msg.id} message={msg} index={i} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-border bg-card/60 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl space-y-2">
            {messages.length > 0 && !isStreaming && (
              <SuggestionChips onSelect={handleSend} disabled={isStreaming} />
            )}
            <ChatInput
              onSend={handleSend}
              onStop={handleStop}
              isStreaming={isStreaming}
              disabled={false}           
               />
            <p className="text-center text-[10px] text-muted-foreground">
              Twin AI represents Abhishek's verified professional information only
            </p>
          </div>
        </div>
      </div>

      {/* ─── Desktop right panel: Profile ─── */}
      <aside className="hidden md:flex w-80 shrink-0 flex-col border-l border-border bg-card">
        <ProfilePanel />
      </aside>

      {/* ─── Mobile: History Sheet ─── */}
     {/*<Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent
          side="left"
          className="w-72 max-w-[calc(100%-2rem)] p-0 bg-sidebar border-r border-border"
        >
          <ConversationHistory
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={loadSession}
            onNewSession={startNewSession}
            onClose={() => setShowHistory(false)}
          />
        </SheetContent>
      </Sheet>*/}

      {/* ─── Mobile: Profile Sheet ─── */}
      <Sheet open={showProfile} onOpenChange={setShowProfile}>
        <SheetContent
          side="right"
          className="w-72 max-w-[calc(100%-2rem)] p-0 bg-card border-l border-border"
        >
          <ProfilePanel />
        </SheetContent>
      </Sheet>
    </div>
  );
}
