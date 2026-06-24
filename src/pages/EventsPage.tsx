import { PublicLayout, PageHero, LoadingState, EmptyState } from '../components/Layout';
import { useEvents } from '../lib/data';
import { Calendar, MapPin } from 'lucide-react';

export function EventsPage() {
  const { data, loading } = useEvents();
  const upcoming = data.filter((e) => e.event_date && new Date(e.event_date) >= new Date(Date.now() - 86400000));
  const past = data.filter((e) => e.event_date && new Date(e.event_date) < new Date(Date.now() - 86400000));

  return (
    <PublicLayout>
      <PageHero eyebrow="Gatherings" title="Events" subtitle="Momums where the aura becomes tangible — live, in person, and in spirit." />

      <section className="max-w-5xl mx-auto px-5 md:px-10 pb-24 space-y-16">
        {loading ? (
          <LoadingState label="Looking ahead…" />
        ) : data.length === 0 ? (
          <EmptyState title="No events scheduled" hint="Upcoming gatherings will be posted here." />
        ) : (
          <>
            <EventBlock title="Upcoming" events={upcoming} />
            {past.length > 0 && <EventBlock title="Past" events={past} muted />}
          </>
        )}
      </section>
    </PublicLayout>
  );
}

function EventBlock({ title, events, muted }: { title: string; events: ReturnType<typeof useEvents>['data']; muted?: boolean }) {
  if (events.length === 0) return null;
  return (
    <div>
      <h2 className="font-display text-2xl text-white mb-6">{title}</h2>
      <div className="space-y-5">
        {events.map((e) => (
          <article key={e.id} className={`glass-card p-6 flex flex-col md:flex-row gap-6 ${muted ? 'opacity-70' : ''}`}>
            {e.event_date && (
              <div className="shrink-0 text-center px-5 py-4 rounded-2xl bg-aura-500/10 border border-aura-400/20">
                <p className="font-display text-3xl text-white">{new Date(e.event_date).getDate()}</p>
                <p className="text-xs uppercase tracking-widest text-aura-200">
                  {new Date(e.event_date).toLocaleDateString(undefined, { month: 'short' })}
                </p>
                <p className="text-xs text-slate-400">{new Date(e.event_date).getFullYear()}</p>
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-display text-xl text-white">{e.title}</h3>
              {e.location && (
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-400">
                  <MapPin size={13} /> {e.location}
                </p>
              )}
              {e.description && <p className="mt-3 text-sm text-slate-400">{e.description}</p>}
              {e.event_date && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar size={12} />
                  {new Date(e.event_date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
              <p className="mt-3 text-xs text-slate-500">Published by Love Parekh</p>
            </div>
            {e.image_url && (
              <div className="shrink-0 h-28 w-40 rounded-xl overflow-hidden border border-white/10">
                <img src={e.image_url} alt={e.title} className="h-full w-full object-cover" />
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
