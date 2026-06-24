import { ArrowDown, Sparkles } from 'lucide-react';
import { navigate } from '../lib/router';

export function HeroBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
      {/* Aura orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[12%] left-[10%] h-72 w-72 rounded-full bg-aura-500/25 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[18%] right-[8%] h-96 w-96 rounded-full bg-neon-blue/15 blur-[140px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[55%] h-80 w-80 rounded-full bg-neon-violet/20 blur-[130px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
      </div>

      {/* Rotating aura ring */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="relative h-[640px] w-[640px] opacity-40">
          <div className="absolute inset-0 rounded-full border border-aura-400/20 animate-aura-rotate" style={{ borderTopColor: 'rgba(233,100,255,0.5)' }} />
          <div className="absolute inset-12 rounded-full border border-neon-blue/15 animate-aura-rotate" style={{ animationDuration: '30s', borderTopColor: 'rgba(61,240,255,0.4)' }} />
          <div className="absolute inset-28 rounded-full border border-neon-violet/15 animate-aura-rotate" style={{ animationDuration: '40s', animationDirection: 'reverse', borderTopColor: 'rgba(139,92,255,0.4)' }} />
        </div>
      </div>

      <div className="relative z-10 px-6 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 chip mb-6 animate-fade-up">
          <Sparkles size={12} className="text-neon-pink" />
          <span className="tracking-[0.3em] uppercase text-[10px]">A universe of art, sound &amp; light</span>
        </div>

        <h1 className="font-display text-6xl md:text-8xl font-semibold leading-[0.95] text-balance animate-fade-up" style={{ animationDelay: '80ms' }}>
          <span className="aura-gradient-text">{title}</span>
        </h1>

        <p className="mt-7 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto text-balance animate-fade-up" style={{ animationDelay: '180ms' }}>
          {subtitle}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '280ms' }}>
          <button onClick={() => navigate('/blog')} className="aura-btn-primary">
            Enter the Writings
          </button>
          <button onClick={() => navigate('/gallery')} className="aura-btn-ghost">
            View the Gallery
          </button>
        </div>

        <p className="mt-12 text-xs uppercase tracking-[0.32em] text-slate-500 animate-fade-up" style={{ animationDelay: '380ms' }}>
          Published by Love Parekh
        </p>
      </div>

      <button
        onClick={() => window.scrollTo({ top: window.innerHeight - 100, behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 hover:text-aura-200 transition animate-float"
        aria-label="Scroll down"
      >
        <ArrowDown size={20} />
      </button>
    </section>
  );
}
