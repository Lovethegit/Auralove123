import { useEffect, useState } from 'react';
import { Sparkles, BookOpen, Quote, Film, ScrollText } from 'lucide-react';
import { publicFeatures } from '../lib/agents';
import type { SerializedChapter } from '../lib/agents';

type StreamItem = { type: string; title: string; created_at: string; id: string };

const ICONS: Record<string, typeof BookOpen> = {
  blog: BookOpen,
  quote: Quote,
  media: Film,
  chapter: ScrollText,
};

const ACCENTS: Record<string, string> = {
  blog: '#3df0ff',
  quote: '#ff3df1',
  media: '#ee9bff',
  chapter: '#8b5cff',
};

export function AuroraStream() {
  const [items, setItems] = useState<StreamItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await publicFeatures.auroraStream();
        if (active) { setItems(data); setLoading(false); }
      } catch { if (active) setLoading(false); }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-display text-white/90 mb-1 flex items-center gap-2">
        <Sparkles size={20} className="text-aura-cyan" />
        The Aurora Stream
      </h2>
      <p className="text-sm text-white/40 mb-6">Fresh from the atelier — new work as it arrives.</p>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => {
          const Icon = ICONS[item.type] || BookOpen;
          const color = ACCENTS[item.type] || '#3df0ff';
          return (
            <div
              key={`${item.type}-${item.id}`}
              className="group flex items-start gap-3 p-4 rounded-2xl border border-white/5 hover:border-white/20 transition-all bg-white/[0.02] hover:bg-white/[0.05]"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}33` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color }}>{item.type}</div>
                <div className="text-sm text-white/80 font-medium line-clamp-2 group-hover:text-white transition-colors">{item.title}</div>
                <div className="text-[10px] text-white/30 mt-1">{new Date(item.created_at).toLocaleDateString()}</div>
              </div>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ===== The Loom (Serialized Story) =====

export function TheLoom() {
  const [chapters, setChapters] = useState<SerializedChapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await publicFeatures.chapters();
        if (active) { setChapters(data); setLoading(false); }
      } catch { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  if (loading || chapters.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-2xl font-display text-white/90 flex items-center gap-2">
          <ScrollText size={20} className="text-aura-purple" />
          The Loom
        </h2>
        <span className="text-xs text-white/40">{chapters.length} chapter{chapters.length !== 1 ? 's' : ''}</span>
      </div>
      <p className="text-sm text-white/40 mb-6">An unfolding narrative, woven one chapter at a time.</p>
      <div className="space-y-2">
        {chapters.map((ch, idx) => (
          <a
            key={ch.id}
            href={`/loom/${ch.id}`}
            className="group flex items-center gap-4 p-4 rounded-2xl border border-white/5 hover:border-aura-purple/30 transition-all bg-white/[0.02] hover:bg-white/[0.04]"
          >
            <div className="text-3xl font-display text-white/15 group-hover:text-aura-purple/50 transition-colors w-8 text-center">
              {String(idx + 1).padStart(2, '0')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate">{ch.title}</div>
              {ch.excerpt && <div className="text-xs text-white/40 line-clamp-1 mt-0.5">{ch.excerpt}</div>}
            </div>
            {ch.published_at && (
              <div className="text-[10px] text-white/30">{new Date(ch.published_at).toLocaleDateString()}</div>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
