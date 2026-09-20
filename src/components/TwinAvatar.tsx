/* import { Cpu } from 'lucide-react';

interface TwinAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-14 h-14',
};

const iconSizeMap = {
  sm: 14,
  md: 18,
  lg: 28,
};

export function TwinAvatar({ size = 'md', className = '' }: TwinAvatarProps) {
  return (
    <div
      className={`${sizeMap[size]} ${className} flex shrink-0 items-center justify-center rounded-full`}
      style={{
        background: 'linear-gradient(135deg, hsl(340 80% 49%), hsl(320 70% 42%))',
        boxShadow: '0 0 16px hsl(340 80% 49% / 0.45)',
      }}
    >
      <Cpu size={iconSizeMap[size]} className="text-white" strokeWidth={1.5} />
    </div>
  );
} */


  interface TwinAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-14 h-14',
};

export function TwinAvatar({
  size = 'md',
  className = '',
}: TwinAvatarProps) {
  return (
    <div
      className={`${sizeMap[size]} ${className} flex shrink-0 items-center justify-center overflow-hidden rounded-full`}
      style={{
        background:
          'linear-gradient(135deg, hsl(340 80% 49%), hsl(320 70% 42%))',
        boxShadow: '0 0 16px hsl(340 80% 49% / 0.45)',
      }}
    >
      <img
        src="/favicon.png"
        alt="Chatbot"
        className="h-full w-full rounded-full object-cover"

      />
    </div>
  );
}
