import { type ReactNode, useEffect, useState } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { BackgroundMusicPlayer } from './BackgroundMusicPlayer';
import { useHashRoute, scrollToTop } from '../lib/router';
import { publicApi } from '../lib/data';
import type { SiteSettings } from '../lib/adminApi';

export function PublicLayout({ children }: { children: ReactNode }) {
  const route = useHashRoute();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  useEffect(() => { scrollToTop(); }, [route.path]);
  useEffect(() => { publicApi.settings().then(setSettings).catch(() => undefined); }, []);
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
      <BackgroundMusicPlayer
        audioUrl={settings?.ambient_audio_url ?? null}
        label={settings?.ambient_label || 'Ambient Aura'}
        accentHex={settings?.accent_hex || '#3df0ff'}
      />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-aura-grid bg-[size:48px_48px] opacity-30 pointer-events-none" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[80%] bg-aura-500/20 blur-[100px] rounded-full pointer-events-none animate-pulse-glow" />
      <div className="relative max-w-7xl mx-auto px-5 md:px-10 pt-20 pb-12 text-center">
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.4em] text-aura-200/70 mb-4 animate-fade-up">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-4xl md:text-6xl font-semibold text-balance animate-fade-up">
          <span className="aura-gradient-text">{title}</span>
        </h1>
        {subtitle && (
          <p className="mt-5 text-slate-300 max-w-2xl mx-auto text-balance animate-fade-up" style={{ animationDelay: '120ms' }}>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-aura-400/40 to-transparent" />
      <h2 className="font-display text-2xl md:text-3xl text-white whitespace-nowrap">{children}</h2>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-aura-400/40 to-transparent" />
    </div>
  );
}

export function LoadingState({ label = 'Channeling the aura…' }: { label?: string }) {
  return (
    <div className="grid place-items-center py-24">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-2 border-aura-400/30 border-t-aura-400 animate-spin" />
        <div className="absolute inset-0 h-16 w-16 rounded-full bg-aura-500/20 blur-xl animate-pulse" />
      </div>
      <p className="mt-5 text-sm text-slate-400">{label}</p>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="text-center py-24 px-6">
      <div className="mx-auto mb-5 h-20 w-20 rounded-full border border-white/10 grid place-items-center bg-white/[0.02]">
        <span className="h-10 w-10 rounded-full bg-gradient-to-br from-aura-500/40 to-neon-blue/30 blur-[2px]" />
      </div>
      <h3 className="font-display text-2xl text-white">{title}</h3>
      {hint && <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">{hint}</p>}
    </div>
  );
}
