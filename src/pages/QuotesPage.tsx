import { PublicLayout, PageHero, LoadingState, EmptyState } from '../components/Layout';
import { useQuotes } from '../lib/data';
import { Quote as QuoteIcon } from 'lucide-react';

export function QuotesPage() {
  const { data, loading } = useQuotes();

  return (
    <PublicLayout>
      <PageHero eyebrow="In Words" title="Quotes" subtitle="Distilled thoughts — small fragments of the larger aura." />
      <section className="max-w-6xl mx-auto px-5 md:px-10 pb-24">
        {loading ? (
          <LoadingState label="Gathering the words…" />
        ) : data.length === 0 ? (
          <EmptyState title="No quotes yet" hint="Words will be gathered here." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {data.map((q) => (
              <QuoteCard key={q.id} text={q.text} source={q.source} />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

export function QuoteCard({ text, source }: { text: string; source?: string | null }) {
  return (
    <article className="group glass-card p-8 relative overflow-hidden hover:border-aura-400/40 transition-all duration-500">
      <div className="absolute -top-4 -left-2 text-aura-500/15 font-display text-9xl select-none">&ldquo;</div>
      <QuoteIcon size={18} className="text-neon-pink/60 mb-4" />
      <p className="relative font-display text-xl md:text-2xl text-white leading-relaxed text-balance">{text}</p>
      {source && <p className="mt-4 text-sm text-aura-200">— {source}</p>}
      <p className="mt-4 text-xs text-slate-500">Published by Love Parekh</p>
    </article>
  );
}
