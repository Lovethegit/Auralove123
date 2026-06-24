import { useEffect, useState } from 'react';
import { PublicLayout, LoadingState, EmptyState } from '../components/Layout';
import { publicApi } from '../lib/data';
import { navigate } from '../lib/router';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import type { BlogPost } from '../lib/adminApi';

export function BlogPostPage({ id }: { id: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    publicApi
      .blogPost(id)
      .then((p) => {
        setPost(p);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <PublicLayout><LoadingState label="Opening the page…" /></PublicLayout>;
  if (error || !post) return (
    <PublicLayout>
      <EmptyState title="This story was not found" hint="It may have been moved or unpublished." />
      <div className="text-center pb-20">
        <button onClick={() => navigate('/blog')} className="aura-btn-ghost">Back to blog</button>
      </div>
    </PublicLayout>
  );

  return (
    <PublicLayout>
      <article className="max-w-3xl mx-auto px-5 md:px-10 py-16">
        <button onClick={() => navigate('/blog')} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-aura-200 mb-8 transition">
          <ArrowLeft size={16} /> Back to blog
        </button>

        {post.cover_image_url && (
          <div className="mb-10 overflow-hidden rounded-3xl border border-white/10 max-h-[460px]">
            <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-slate-500 mb-5">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={12} /> {new Date(post.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          {post.tags.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Tag size={12} /> {post.tags.join(', ')}
            </span>
          )}
        </div>

        <h1 className="font-display text-4xl md:text-5xl text-white mb-4 text-balance">{post.title}</h1>
        {post.excerpt && <p className="text-lg text-slate-400 italic mb-8">{post.excerpt}</p>}

        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/[0.06]">
          <span className="h-10 w-10 rounded-full bg-gradient-to-br from-aura-400 to-neon-violet grid place-items-center text-xs font-semibold text-white">LP</span>
          <div>
            <p className="text-sm text-white">Published by Love Parekh</p>
            <p className="text-xs text-slate-500">Author &middot; Creator</p>
          </div>
        </div>

        {post.body && (
          <div className="prose-aura max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
        )}
      </article>
    </PublicLayout>
  );
}

// Minimal markdown renderer (headings, bold, italic, lists, links, blockquotes, code).
function renderMarkdown(md: string): string {
  const escaped = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h2>$1</h2>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-white/5 text-aura-200 text-sm">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^\- (.*)$/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<)/, '<p>')
    .replace(/$/, '</p>');
}
