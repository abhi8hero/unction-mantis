import { motion } from 'motion/react';
import { Streamdown } from 'streamdown';
import type { ChatMessage } from '@/types/types';
import { TwinAvatar } from '@/components/TwinAvatar';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.2) }}
      className={cn('flex w-full gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      {!isUser && <TwinAvatar size="sm" className="mt-1" />}

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[80%] min-w-0 rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[72%]',
          isUser
            ? 'rounded-tr-sm text-foreground'
            : 'rounded-tl-sm border border-border bg-card text-card-foreground'
        )}
        style={
          isUser
            ? {
                background: 'linear-gradient(135deg, hsl(340 80% 42%), hsl(320 70% 36%))',
                boxShadow: '0 4px 20px hsl(340 80% 40% / 0.25)',
              }
            : {
                background: 'hsl(var(--card))',
                boxShadow: 'var(--shadow-card)',
              }
        }
      >
        {isUser ? (
          <p className="break-words text-white">{message.content}</p>
        ) : (
          <div className="prose-twin break-words">
            {message.isStreaming ? (
              <Streamdown parseIncompleteMarkdown isAnimating={true}>
                {message.content || ''}
              </Streamdown>
            ) : (
              <Streamdown parseIncompleteMarkdown isAnimating={false}>
                {message.content}
              </Streamdown>
            )}
            {message.isStreaming && message.content === '' && (
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
