import { useEffect, useState } from 'react';
import { adminApi } from '../../lib/adminApi';
import { AdminHeader, Spinner, toast } from './ui';
import { type AdminTab } from './AdminShell';
import { FileText, Film, Quote, Calendar, Image as ImageIcon, Brain, Upload, StickyNote, TrendingUp, Sparkles } from 'lucide-react';

type Counts = {
  blog: number;
  media: number;
  quotes: number;
  events: number;
  gallery: number;
  notes: number;
  drafts: number;
  published: number;
};

export function Overview({ onTab }: { onTab: (tab: AdminTab) => void }) {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.list('blog_posts'),
      adminApi.list('media_items'),
      adminApi.list('quotes'),
      adminApi.list('events'),
      adminApi.list('gallery_images'),
      adminApi.list('self_notes'),
    ])
      .then(([blog, media, quotes, events, gallery, notes]) => {
        const all = [...blog, ...media, ...quotes, ...events, ...gallery] as Array<{ status?: string }>;
        const drafts = all.filter((r) => r.status === 'draft').length;
        const published = all.filter((r) => r.status === 'published').length;
        setCounts({
          blog: blog.length,
          media: media.length,
          quotes: quotes.length,
          events: events.length,
          gallery: gallery.length,
          notes: notes.length,
          drafts,
          published,
        });
      })
      .catch((e) => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !counts) return <Spinner label="Loading overview…" />;

  const cards: { label: string; value: number; icon: typeof FileText; tab: AdminTab; tint: string }[] = [
    { label: 'Blog Posts', value: counts.blog, icon: FileText, tab: 'blog', tint: 'from-aura-500/15 to-transparent text-aura-200' },
    { label: 'Music Videos', value: counts.media, icon: Film, tab: 'media', tint: 'from-neon-blue/15 to-transparent text-neon-blue' },
    { label: 'Quotes', value: counts.quotes, icon: Quote, tab: 'quotes', tint: 'from-neon-violet/15 to-transparent text-neon-violet' },
    { label: 'Events', value: counts.events, icon: Calendar, tab: 'events', tint: 'from-aura-500/15 to-transparent text-aura-200' },
    { label: 'Gallery', value: counts.gallery, icon: ImageIcon, tab: 'gallery', tint: 'from-neon-blue/15 to-transparent text-neon-blue' },
    { label: 'Self Notes', value: counts.notes, icon: StickyNote, tab: 'self-section', tint: 'from-neon-violet/15 to-transparent text-neon-violet' },
  ];

  return (
    <div>
      <AdminHeader title="Overview" subtitle="Your atelier at a glance." />

      {/* Status row */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-500 mb-2"><TrendingUp size={13} /> Published</div>
          <p className="font-display text-4xl text-white">{counts.published}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-500 mb-2"><Sparkles size={13} /> Drafts</div>
          <p className="font-display text-4xl text-white">{counts.drafts}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-500 mb-2"><FileText size={13} /> Total items</div>
          <p className="font-display text-4xl text-white">{counts.published + counts.drafts}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <button onClick={() => onTab('ai-studio')} className="glass-card p-6 text-left hover:border-aura-400/40 hover:-translate-y-0.5 transition group">
          <span className="h-12 w-12 rounded-xl bg-aura-500/15 border border-aura-400/25 grid place-items-center text-neon-pink mb-4"><Brain size={20} /></span>
          <h3 className="font-display text-xl text-white">AI Generation Studio</h3>
          <p className="mt-1 text-sm text-slate-400">Generate blog posts, quotes, and descriptions — attributed as Published by Love Parekh.</p>
        </button>
        <button onClick={() => onTab('uploads')} className="glass-card p-6 text-left hover:border-aura-400/40 hover:-translate-y-0.5 transition group">
          <span className="h-12 w-12 rounded-xl bg-neon-blue/15 border border-neon-blue/25 grid place-items-center text-neon-blue mb-4"><Upload size={20} /></span>
          <h3 className="font-display text-xl text-white">Media Upload</h3>
          <p className="mt-1 text-sm text-slate-400">Upload any file type — video, audio, images, documents. All accepted.</p>
        </button>
      </div>

      {/* Counts grid */}
      <h2 className="font-display text-xl text-white mb-4">Content breakdown</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <button key={c.tab} onClick={() => onTab(c.tab)} className={`glass-card p-5 bg-gradient-to-br ${c.tint} hover:-translate-y-0.5 transition text-left`}>
            <div className="flex items-center justify-between">
              <c.icon size={20} />
              <span className="font-display text-3xl text-white">{c.value}</span>
            </div>
            <p className="mt-3 text-sm text-slate-300">{c.label}</p>
          </button>
        ))}
      </div>

      <div className="glass-card p-5 mt-8">
        <p className="text-xs uppercase tracking-widest text-aura-200/70 mb-1">Attribution</p>
        <p className="font-display text-lg text-white">Published by Love Parekh</p>
        <p className="mt-1 text-xs text-slate-500">Every piece of content — written manually or generated by the AI studio — is permanently labeled as Published by Love Parekh at the database level.</p>
      </div>
    </div>
  );
}
