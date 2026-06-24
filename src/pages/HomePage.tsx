import { type ReactNode } from 'react';
import { PublicLayout } from '../components/Layout';
import { useBlogPosts, useQuotes, useEvents, useGallery } from '../lib/data';
import { navigate } from '../lib/router';
import { QuoteCard } from './QuotesPage';
import { HeroBanner } from '../components/HeroBanner';
import { ArrowRight, Sparkles, Calendar, BookOpen, Image as ImageIcon, Music } from 'lucide-react';
import { useEffect, useState } from 'react';
import { publicApi } from '../lib/data';
import type { SiteSettings } from '../lib/adminApi';
import { AuroraStream, TheLoom } from '../components/AuroraStream';
import { AuraCoins } from '../components/AuraCoins';
import { ConstellationGraph, NewsletterWidget } from '../components/Newsletter';
import { TimeCapsuleVault, ScheduledDropCountdown } from '../components/TimeCapsule';

export function HomePage() {
  const { data: posts, loading: postsLoading } = useBlogPosts();
  const { data: events, loading: eventsLoading } = useEvents();
  const { data: quotes } = useQuotes();
  const { data: gallery } = useGallery();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    publicApi.settings().then((s) => setSettings(s)).catch(() => undefined);
  }, []);

  const featuredPosts = posts.slice(0, 3);
  const upcoming = events
    .filter((e) => e.event_date && new Date(e.event_date) >= new Date(Date.now() - 86400000))
    .slice(0, 3);

  return (
    <PublicLayout>
      <HeroBanner
        title={settings?.hero_title || "Love's Aura"}
        subtitle={settings?.hero_subtitle || 'A universe of art, sound, and light.'}
      />

      {/* Quick explore */}
      <section className="max-w-7xl mx-auto px-5 md:px-10 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Blog', path: '/blog', icon: BookOpen },
            { label: 'Music Videos', path: '/music-videos', icon: Music },
            { label: 'Audio Library', path: '/audio-library', icon: Music },
            { label: 'Gallery', path: '/gallery', icon: ImageIcon },
            { label: 'Events', path: '/events', icon: Calendar },
            { label: 'Quotes', path: '/quotes', icon: Sparkles },
          ].map(({ label, path, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="group glass-card p-4 flex flex-col items-center gap-2 hover:border-aura-400/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              <span className="h-9 w-9 grid place-items-center rounded-full bg-aura-500/10 border border-aura-400/20 text-aura-200 group-hover:bg-aura-500/20 transition">
                <Icon size={16} />
              </span>
              <span className="text-xs text-slate-300 group-hover:text-white">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured blog */}
      <Section wrapper title="Latest Writings" actionLabel="All blog posts" onAction={() => navigate('/blog')}>
        {postsLoading ? (
          <div className="grid gap-6 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : featuredPosts.length === 0 ? (
          <p className="text-center text-slate-400 py-12">Stories are being written. Return soon.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {featuredPosts.map((p) => (
              <article
                key={p.id}
                onClick={() => navigate(`/blog/${p.id}`)}
                className="group glass-card overflow-hidden cursor-pointer hover:border-aura-400/40 hover:-translate-y-1 transition-all duration-500"
              >
                <div className="h-44 bg-ink-800 overflow-hidden">
                  {p.cover_image_url ? (
                    <img src={p.cover_image_url} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-700" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-aura-500/20 to-neon-blue/10 grid place-items-center">
                      <BookOpen className="text-aura-300/40" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg text-white group-hover:text-aura-200 transition">{p.title}</h3>
                  {p.excerpt && <p className="mt-2 text-sm text-slate-400 line-clamp-2">{p.excerpt}</p>}
                  <p className="mt-3 text-xs text-slate-500">Published by Love Parekh</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>

      {/* Upcoming events */}
      <Section wrapper title="Upcoming Events" actionLabel="View all events" onAction={() => navigate('/events')}>
        {eventsLoading ? (
          <div className="grid gap-6 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : upcoming.length === 0 ? (
          <p className="text-center text-slate-400 py-12">No upcoming events scheduled.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {upcoming.map((e) => (
              <article key={e.id} className="glass-card p-6 hover:border-aura-400/40 transition">
                {e.event_date && (
                  <div className="inline-flex items-center gap-2 text-xs text-aura-200 mb-3">
                    <Calendar size={13} />
                    {new Date(e.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                )}
                <h3 className="font-display text-xl text-white">{e.title}</h3>
                {e.location && <p className="mt-1 text-sm text-slate-400">{e.location}</p>}
                {e.description && <p className="mt-3 text-sm text-slate-400 line-clamp-3">{e.description}</p>}
                <p className="mt-4 text-xs text-slate-500">Published by Love Parekh</p>
              </article>
            ))}
          </div>
        )}
      </Section>

      {/* Quote spotlight */}
      {quotes.length > 0 && (
        <Section wrapper title="Aura in Words">
          <div className="grid gap-6 md:grid-cols-2">
            {quotes.slice(0, 2).map((q) => (
              <QuoteCard key={q.id} text={q.text} source={q.source} />
            ))}
          </div>
        </Section>
      )}

      {/* Gallery preview */}
      {gallery.length > 0 && (
        <Section wrapper title="Gallery Glimpses" actionLabel="Open gallery" onAction={() => navigate('/gallery')}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {gallery.slice(0, 4).map((g) => (
              <div key={g.id} className="aspect-square glass-card overflow-hidden group cursor-pointer" onClick={() => navigate('/gallery')}>
                <img src={g.image_url} alt={g.title || ''} className="h-full w-full object-cover group-hover:scale-110 transition duration-700" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Scheduled Drop Countdown */}
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <ScheduledDropCountdown />
      </div>

      {/* Aurora Stream */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16">
        <AuroraStream />
      </div>

      {/* The Loom */}
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <TheLoom />
      </div>

      {/* Aura Coins */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16">
        <AuraCoins />
      </div>

      {/* Constellation */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16">
        <ConstellationGraph />
      </div>

      {/* Time Capsule Vault */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16">
        <TimeCapsuleVault />
      </div>

      {/* Newsletter */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16">
        <NewsletterWidget />
      </div>
    </PublicLayout>
  );
}

function Section({
  children,
  title,
  wrapper,
  actionLabel,
  onAction,
}: {
  children: ReactNode;
  title: string;
  wrapper?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const inner = (
    <>
      <div className="flex items-end justify-between mb-8">
        <h2 className="font-display text-2xl md:text-3xl text-white">{title}</h2>
        {actionLabel && (
          <button onClick={onAction} className="text-sm text-aura-200 hover:text-white flex items-center gap-1 group">
            {actionLabel}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
          </button>
        )}
      </div>
      {children}
    </>
  );
  if (wrapper) {
    return <section className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-20">{inner}</section>;
  }
  return <section className="py-16">{inner}</section>;
}

function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="h-44 bg-ink-800/50 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-white/5 rounded animate-pulse" />
        <div className="h-3 bg-white/5 rounded w-2/3 animate-pulse" />
      </div>
    </div>
  );
}
