import { type MediaItem } from '../lib/adminApi';
import { MediaPlayer } from '../components';
import { Play, FileText, Link as LinkIcon } from 'lucide-react';

export function MediaGrid({
  items,
  emptyHint,
  loading,
}: {
  items: MediaItem[];
  emptyHint?: string;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card overflow-hidden">
            <div className="aspect-video bg-ink-800/50 animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-white/5 rounded animate-pulse" />
              <div className="h-3 bg-white/5 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-aura-500/10 border border-aura-400/20">
          <Play size={22} className="text-aura-300" />
        </div>
        <h3 className="mt-4 font-display text-xl text-white">No media here yet</h3>
        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
          {emptyHint || 'New creations are being gathered. Please return soon.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function MediaCard({ item }: { item: MediaItem }) {
  return (
    <article className="group glass-card overflow-hidden hover:border-aura-400/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-aura-glow">
      <div className="p-3 pb-0">
        <div className="overflow-hidden rounded-xl">
          <MediaPlayer item={item} aspect="video" />
        </div>
      </div>
      <div className="p-5 pt-4">
        <div className="flex items-center gap-2 mb-2">
          {item.media_type === 'embed' ? (
            <span className="chip"><LinkIcon size={11} /> embedded</span>
          ) : (
            <span className="chip"><FileText size={11} /> native</span>
          )}
        </div>
        <h3 className="font-display text-lg text-white group-hover:text-aura-200 transition">{item.title}</h3>
        {item.description && (
          <p className="mt-2 text-sm text-slate-400 line-clamp-3">{item.description}</p>
        )}
        <p className="mt-3 text-xs text-slate-500">Published by Love Parekh</p>
      </div>
    </article>
  );
}
