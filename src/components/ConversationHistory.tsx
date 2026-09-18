import { motion } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Session } from '@/types/types';
import { cn } from '@/lib/utils';

interface ConversationHistoryProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onClose: () => void;
}

export function ConversationHistory({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onClose,
}: ConversationHistoryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.22 }}
      className="flex h-full flex-col bg-sidebar"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
        <span className="gallery-label text-xs text-sidebar-foreground">Conversations</span>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-sidebar-foreground transition-colors hover:text-primary md:hidden"
        >
          <X size={16} />
        </button>
      </div>

      {/* New Conversation */}
      <div className="px-3 py-2">
        <Button
          onClick={onNewSession}
          variant="ghost"
          className="w-full justify-start gap-2 rounded-xl border border-dashed border-sidebar-border text-sidebar-foreground hover:border-primary hover:text-primary"
        >
          <Plus size={15} />
          <span className="text-sm">New Conversation</span>
        </Button>
      </div>

      {/* Sessions list */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {sessions.length === 0 && (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground">
              No conversations yet.
              <br />
              Start chatting below!
            </div>
          )}
          {sessions.map((session) => (
            <button
              key={session.session_id}
              onClick={() => onSelectSession(session.session_id)}
              className={cn(
                'group flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition-all duration-150',
                currentSessionId === session.session_id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare size={13} className="shrink-0 text-primary" />
                <span className="flex-1 min-w-0 truncate text-sm font-medium">
                  {session.title || 'Conversation'}
                </span>
              </div>
              <div className="flex items-center justify-between pl-5">
                <span className="text-[11px] text-muted-foreground">
                  {session.message_count} messages
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                </span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
