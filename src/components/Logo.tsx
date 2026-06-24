import { Heart } from 'lucide-react';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onClick?: () => void;
};

const DIMS = {
  sm: { box: 'h-9 w-9', icon: 16, text: 'text-lg', sub: 'text-[9px]' },
  md: { box: 'h-11 w-11', icon: 20, text: 'text-2xl', sub: 'text-[10px]' },
  lg: { box: 'h-16 w-16', icon: 30, text: 'text-4xl', sub: 'text-xs' },
} as const;

export function Logo({ size = 'md', showText = true, onClick }: LogoProps) {
  const d = DIMS[size];
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 select-none"
      aria-label="Love's Aura home"
    >
      <span className={`relative ${d.box} grid place-items-center`}>
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-aura-400 via-neon-violet to-neon-blue opacity-60 blur-sm transition-opacity duration-500 group-hover:opacity-90" />
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-aura-500 to-neon-violet" />
        <span className="absolute inset-[2px] rounded-full bg-ink-950/85" />
        <Heart
          size={d.icon}
          className="relative z-10 text-neon-pink drop-shadow-[0_0_8px_rgba(255,61,241,0.9)] transition-transform duration-500 group-hover:scale-110"
          fill="currentColor"
        />
      </span>
      {showText && (
        <span className="flex flex-col items-start leading-none">
          <span className={`font-display font-semibold ${d.text} aura-gradient-text tracking-tight`}>
            Love&rsquo;s Aura
          </span>
          <span className={`uppercase tracking-[0.32em] text-slate-400 ${d.sub} mt-1`}>
            Art &middot; Sound &middot; Light
          </span>
        </span>
      )}
    </button>
  );
}
