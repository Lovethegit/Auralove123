import { PublicLayout, PageHero, LoadingState, EmptyState } from '../components/Layout';
import { useGallery } from '../lib/data';
import { useState } from 'react';
import { X } from 'lucide-react';
import type { GalleryImage } from '../lib/adminApi';

export function GalleryPage() {
  const { data, loading } = useGallery();
  const [active, setActive] = useState<GalleryImage | null>(null);

  return (
    <PublicLayout>
      <PageHero eyebrow="Visual Worlds" title="Gallery" subtitle="A curated collection of visuals — every frame carrying its own aura." />

      <section className="max-w-7xl mx-auto px-5 md:px-10 pb-24">
        {loading ? (
          <LoadingState label="Collecting the visuals…" />
        ) : data.length === 0 ? (
          <EmptyState title="The gallery is being curated" hint="Visual creations will appear here soon." />
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
            {data.map((img) => (
              <button
                key={img.id}
                onClick={() => setActive(img)}
                className="group mb-5 block w-full overflow-hidden rounded-2xl border border-white/10 break-inside-avoid hover:border-aura-400/40 transition"
              >
                <div className="relative">
                  <img src={img.image_url} alt={img.title || ''} className="w-full object-cover group-hover:scale-105 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                  {(img.title || img.description) && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-left translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition duration-300">
                      {img.title && <p className="font-display text-white">{img.title}</p>}
                      {img.description && <p className="text-xs text-slate-300 line-clamp-2">{img.description}</p>}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {data.length > 0 && (
          <p className="mt-10 text-center text-xs text-slate-500">All works Published by Love Parekh</p>
        )}
      </section>

      {active && (
        <div
          className="fixed inset-0 z-[100] bg-ink-950/90 backdrop-blur-xl grid place-items-center p-6"
          onClick={() => setActive(null)}
        >
          <button className="absolute top-6 right-6 h-11 w-11 grid place-items-center rounded-full border border-white/10 text-white hover:bg-white/5" aria-label="Close">
            <X size={20} />
          </button>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={active.image_url} alt={active.title || ''} className="w-full max-h-[80vh] object-contain rounded-2xl" />
            {active.title && <h3 className="mt-4 font-display text-xl text-white">{active.title}</h3>}
            {active.description && <p className="mt-1 text-sm text-slate-400">{active.description}</p>}
            <p className="mt-3 text-xs text-slate-500">Published by Love Parekh</p>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
