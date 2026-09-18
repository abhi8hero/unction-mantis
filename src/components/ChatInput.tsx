import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import type { VoiceState } from '@/components/VoiceRecorder';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isVoiceActive = voiceState !== 'idle';

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming) handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  // When voice transcription completes, put text in input and auto-send
  const handleTranscript = (text: string) => {
    setValue(text);
    // Give React a tick to update, then send
    setTimeout(() => {
      onSend(text);
      setValue('');
    }, 80);
  };

  const handleVoiceError = (msg: string) => {
    toast.error(msg);
  };

  const canSend = !!value.trim() && !disabled && !isVoiceActive;

  return (
    <div
      className={cn(
        'flex items-end gap-2 rounded-2xl border bg-card p-2 transition-all duration-200',
        isVoiceActive ? 'border-primary/60 shadow-[0_0_16px_hsl(340_80%_49%/0.18)]' : 'border-border'
      )}
      style={{ boxShadow: isVoiceActive ? undefined : 'var(--shadow-card)' }}
    >
      {/* Voice recorder button */}
      <VoiceRecorder
        onTranscript={handleTranscript}
        onError={handleVoiceError}
        onStateChange={setVoiceState}
        disabled={disabled || isStreaming}
      />

      {/* Text input — show hint when recording */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={
          voiceState === 'recording'
            ? '🎙 Listening… tap mic to stop'
            : voiceState === 'processing'
            ? '⏳ Transcribing…'
            : 'Ask me about my skills, projects, or experience…'
        }
        className="min-h-[44px] resize-none border-0 bg-transparent px-2 py-2 text-sm shadow-none focus-visible:ring-0"
        rows={1}
        disabled={disabled || isVoiceActive}
      />

      {/* Send / Stop button */}
      {isStreaming ? (
        <Button
          size="icon"
          variant="ghost"
          onClick={onStop}
          className={cn(
            'shrink-0 rounded-xl border border-primary/40 text-primary hover:bg-primary/10'
          )}
          title="Stop generating"
        >
          <Square size={16} fill="currentColor" />
        </Button>
      ) : (
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!canSend}
          className="shrink-0 rounded-xl"
          title="Send message"
          style={{
            background: canSend
              ? 'linear-gradient(135deg, hsl(340 80% 49%), hsl(320 70% 42%))'
              : undefined,
          }}
        >
          <Send size={16} />
        </Button>
      )}
    </div>
  );
}
