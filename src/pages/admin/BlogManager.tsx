import { useEffect, useState } from 'react';
import { adminApi, type BlogPost } from '../../lib/adminApi';
import { AdminHeader, StatusBadge, ConfirmDialog, ActionButton, EmptyAdmin, Spinner, toast, Field } from './ui';
import { Plus, Pencil, Trash2, Save, X, FileText, Eye } from 'lucide-react';
import { navigate } from '../../lib/router';

type Draft = { id?: string; title: string; excerpt: string; body: string; cover_image_url: string; tags: string; status: 'draft' | 'published' };

const EMPTY_DRAFT: Draft = {
  title: '',
  excerpt: '',
  body: '',
  cover_image_url: '',
  tags: '',
  status: 'draft',
};

export function BlogManager() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.list<BlogPost>('blog_posts', { orderColumn: 'created_at', ascending: false })
      .then(setItems)
      .catch((e) => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startNew = () => setEditing({ ...EMPTY_DRAFT });
  const startEdit = (p: BlogPost) =>
    setEditing({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt || '',
      body: p.body || '',
      cover_image_url: p.cover_image_url || '',
      tags: p.tags.join(', '),
      status: p.status,
    });

  const save = async (overrideStatus?: 'draft' | 'published') => {
    if (!editing) return;
    if (!editing.title.trim()) return toast('Title is required.', 'error');
    setSaving(true);
    const status = overrideStatus || editing.status;
    const row = {
      title: editing.title.trim(),
      excerpt: editing.excerpt.trim() || null,
      body: editing.body || null,
      cover_image_url: editing.cover_image_url.trim() || null,
      tags: editing.tags.split(',').map((t) => t.trim()).filter(Boolean),
      status,
    };
    try {
      if (editing.id) {
        await adminApi.update<BlogPost>('blog_posts', editing.id, row);
        toast('Post updated.');
      } else {
        await adminApi.create<BlogPost>('blog_posts', row);
        toast('Post created.');
      }
      setEditing(null);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    try {
      await adminApi.remove('blog_posts', id);
      toast('Post deleted.');
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  if (editing) {
    return (
      <div>
        <AdminHeader
          title={editing.id ? 'Edit Post' : 'New Post'}
          subtitle="All posts are attributed as Published by Love Parekh."
          action={
            <div className="flex gap-2">
              <ActionButton variant="ghost" onClick={() => setEditing(null)}><X size={15} /> Cancel</ActionButton>
              <ActionButton variant="ghost" loading={saving} onClick={() => save('draft')}>Save as Draft</ActionButton>
              <ActionButton loading={saving} onClick={() => save('published')}><Save size={15} /> Publish</ActionButton>
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <Field label="Title">
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="aura-input" placeholder="A captivating title…" />
            </Field>
            <Field label="Excerpt" hint="One or two sentences shown in the card and at the top of the article.">
              <textarea value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} rows={2} className="aura-input resize-none" placeholder="A short hook for readers…" />
            </Field>
            <Field label="Body" hint="Markdown supported — headings, bold, italics, lists, links, blockquotes.">
              <textarea value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} rows={20} className="aura-input resize-y font-mono text-sm" placeholder="Begin writing…" />
            </Field>
          </div>

          <div className="space-y-5">
            <div className="glass-card p-5 space-y-4">
              <Field label="Cover image URL">
                <input value={editing.cover_image_url} onChange={(e) => setEditing({ ...editing, cover_image_url: e.target.value })} className="aura-input" placeholder="https://…" />
              </Field>
              {editing.cover_image_url && (
                <div className="aspect-video rounded-xl overflow-hidden border border-white/10">
                  <img src={editing.cover_image_url} alt="cover preview" className="h-full w-full object-cover" />
                </div>
              )}
              <Field label="Status">
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as 'draft' | 'published' })} className="aura-input">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>
            </div>

            <div className="glass-card p-5">
              <Field label="Tags" hint="Comma-separated.">
                <input value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} className="aura-input" placeholder="poetry, aura, light" />
                {editing.tags && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editing.tags.split(',').map((t) => t.trim()).filter(Boolean).map((t, i) => (
                      <span key={i} className="chip">{t}</span>
                    ))}
                  </div>
                )}
              </Field>
            </div>

            <div className="glass-card p-5">
              <p className="text-xs uppercase tracking-widest text-aura-200/70 mb-2">Attribution</p>
              <p className="text-sm text-slate-300">This post will be permanently attributed to:</p>
              <p className="mt-2 font-display text-lg text-white">Published by Love Parekh</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader
        title="Blog Posts"
        subtitle={`${items.length} ${items.length === 1 ? 'post' : 'posts'}`}
        action={<ActionButton onClick={startNew}><Plus size={15} /> New post</ActionButton>}
      />

      {loading ? (
        <Spinner label="Loading posts…" />
      ) : items.length === 0 ? (
        <EmptyAdmin title="No posts yet" hint="Create your first post or generate one in the AI Studio." />
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p.id} className="glass-card p-5 flex items-center gap-4 hover:border-aura-400/30 transition">
              <div className="h-16 w-24 rounded-lg overflow-hidden bg-ink-800 shrink-0">
                {p.cover_image_url ? (
                  <img src={p.cover_image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center"><FileText size={18} className="text-slate-600" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg text-white truncate">{p.title}</h3>
                <p className="text-xs text-slate-500 truncate">{p.excerpt || 'No excerpt'}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString()}</span>
                  {p.tags.length > 0 && <span className="text-xs text-slate-500">· {p.tags.join(', ')}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => navigate(`/blog/${p.id}`)} className="h-9 w-9 grid place-items-center rounded-lg text-slate-400 hover:text-aura-200 hover:bg-white/5" aria-label="View">
                  <Eye size={16} />
                </button>
                <button onClick={() => startEdit(p)} className="h-9 w-9 grid place-items-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5" aria-label="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => setConfirmDelete(p.id)} className="h-9 w-9 grid place-items-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10" aria-label="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete post?"
        message="This action cannot be undone."
        onConfirm={() => confirmDelete && del(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
