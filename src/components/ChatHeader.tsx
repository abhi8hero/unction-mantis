import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TwinAvatar } from '@/components/TwinAvatar';

interface ChatHeaderProps {
  onToggleHistory: () => void;
  onToggleProfile: () => void;
  showProfileToggle?: boolean;
}

export function ChatHeader({ onToggleHistory, onToggleProfile, showProfileToggle }: ChatHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-sm">
      {/* History toggle */}
      {/* <Button
        variant="ghost"
        size="icon"
        onClick={onToggleHistory}
        className="shrink-0 text-muted-foreground hover:text-foreground"
        title="Conversation history"
      >
        <Menu size={18} />
      </Button> */}

      {/* Identity */}
      <div className="flex flex-1 min-w-0 items-center gap-2.5">
        <TwinAvatar size="sm" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-bold text-foreground text-sm">Unction Mantis</span>
            <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              LIVE
            </span>
          </div>
          <p className="truncate text-[11px] text-muted-foreground">Abhishek's Digital Professional Twin</p>
        </div>
      </div>

      {/* Profile toggle (mobile) */}
      {showProfileToggle && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleProfile}
          className="shrink-0 text-muted-foreground hover:text-foreground md:hidden"
          title="View profile"
        >
          <User size={20} />
        </Button>
      )}

      {/* Status indicator */}
      <div className="hidden shrink-0 items-center gap-1.5 md:flex">
        <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_6px_hsl(340_80%_49%)]" />
        <span className="gallery-label text-[10px] text-muted-foreground">Online</span>
      </div>
    </header>
  );
}
