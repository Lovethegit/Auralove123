import { useState } from 'react';
import { PublicLayout, PageHero, LoadingState, EmptyState } from '../components/Layout';
import { useBlogPosts } from '../lib/data';
import { navigate } from '../lib/router';
import { Search, BookOpen } from 'lucide-react';
import type { BlogPost } from '../lib/adminApi';

export function BlogPage() {
  const { data, loading } = useBlogPosts();
  const [q, setQ] = useState('');
  const filtered = q ? data.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()) || (p.excerpt || '').toLowerCase().includes(q.toLowerCase())) : data;

  return (
    <PublicLayout>
      <PageHero eyebrow="The Journal" title="Blog" subtitle="Reflections, stories, and auras captured in words — every entry published by Love Parekh." />

      <section className="max-w-7xl mx-auto px-5 md:px-10 pb-20">
        <div className="relative max-w-md mb-10">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search writings…" className="aura-input pl-11" />
        </div>

        {loading ? (
          <LoadingState label="Gathering the writings…" />
        ) : filtered.length === 0 ? (
          <EmptyState title="Nothing published yet" hint="When new writings are ready, they will appear here." />
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article
      onClick={() => navigate(`/blog/${post.id}`)}
      className="group glass-card overflow-hidden cursor-pointer hover:border-aura-400/40 hover:-translate-y-1 hover:shadow-aura-glow transition-all duration-500"
    >
      <div className="h-52 overflow-hidden bg-ink-800">
        {post.cover_image_url ? (
          <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-700" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-aura-500/15 to-neon-blue/10 grid place-items-center">
            <BookOpen size={32} className="text-aura-300/40" />
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.slice(0, 3).map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>
        <h3 className="font-display text-xl text-white group-hover:text-aura-200 transition">{post.title}</h3>
        {post.excerpt && <p className="mt-2 text-sm text-slate-400 line-clamp-3">{post.excerpt}</p>}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span>Published by Love Parekh</span>
        </div>
      </div>
    </article>
  );
}
