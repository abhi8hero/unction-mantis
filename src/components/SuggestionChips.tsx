import { motion } from 'motion/react';

const SUGGESTIONS = [
  'Tell me about your skills',
  'What projects have you built?',
  'Tell me about yourself',
  'What roles interest you?',
  'Walk me through your education',
  'What tools do you work with?',
];

interface SuggestionChipsProps {
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

export function SuggestionChips({ onSelect, disabled }: SuggestionChipsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="flex flex-wrap gap-2"
    >
      {SUGGESTIONS.map((s, i) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          disabled={disabled}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-all duration-200 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {s}
        </button>
      ))}
    </motion.div>
  );
}
