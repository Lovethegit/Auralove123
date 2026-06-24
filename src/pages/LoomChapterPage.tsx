import { useEffect, useState } from 'react';
import { PublicLayout } from '../components/Layout';
import { publicFeatures, type SerializedChapter } from '../lib/agents';
import { Spinner } from './admin/ui';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

export function LoomChapterPage({ id }: { id: string }) {
  const [chapter, setChapter] = useState<SerializedChapter | null>(null);
  const [all, setAll] = useState<SerializedChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([publicFeatures.chapter(id), publicFeatures.chapters()])
      .then(([c, all]) => { setChapter(c); setAll(all); if (!c) setError(true); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PublicLayout><div className="flex justify-center py-20"><Spinner label="Loading chapter…" /></div></PublicLayout>;
  if (error || !chapter) return <PublicLayout><div className="text-center py-20 text-white/50">Chapter not found.</div></PublicLayout>;

  const idx = all.findIndex(c => c.id === id);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <PublicLayout>
      <article className="max-w-2xl mx-auto px-5 md:px-8 py-12">
        <a href="/#/loom" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-6">
          <ArrowLeft size={14} /> Back to The Loom
        </a>
        <div className="text-xs uppercase tracking-widest text-aura-violet mb-2" style={{ color: '#8b5cff' }}>Chapter {chapter.chapter_number}</div>
        <h1 className="font-display text-3xl md:text-4xl text-white mb-3 leading-tight">{chapter.title}</h1>
        {chapter.excerpt && <p className="text-lg text-white/50 font-display italic mb-8">{chapter.excerpt}</p>}
        <div className="prose-content text-white/70 leading-relaxed whitespace-pre-wrap text-base md:text-lg">{chapter.body}</div>
        <div className="text-xs text-white/30 mt-8">Published by Love Parekh · {chapter.published_at ? new Date(chapter.published_at).toLocaleDateString() : ''}</div>

        {/* Prev/Next */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/10">
          {prev ? (
            <a href={`/#/loom/${prev.id}`} className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors">
              <ChevronLeft size={16} /> Previous
            </a>
          ) : <div />}
          {next ? (
            <a href={`/#/loom/${next.id}`} className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors">
              Next <ChevronRight size={16} />
            </a>
          ) : <div />}
        </div>
      </article>
    </PublicLayout>
  );
}
