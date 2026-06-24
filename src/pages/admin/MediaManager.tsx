import { useEffect, useState } from 'react';
import { adminApi, type MediaItem, type MediaCategory } from '../../lib/adminApi';
import { AdminHeader, StatusBadge, ConfirmDialog, ActionButton, EmptyAdmin, Spinner, toast, Field } from './ui';
import { Plus, Pencil, Trash2, Save, X, Film, Link as LinkIcon, Upload as UploadIcon, ExternalLink, Save as SaveIcon } from 'lucide-react';
import { isEmbeddable, toEmbedUrl } from '../../lib/media';
import { MediaUpload } from './MediaUpload';

type Draft = { id?: string; title: string; description: string; category: MediaCategory; media_type: 'native' | 'embed'; storage_path: string; external_url: string; embed_url: string; thumbnail_url: string; status: 'draft' | 'published'; sort_order: number };

const CATEGORY_LABELS: Record<MediaCategory, string> = {
  music_videos: 'Music Videos',
  audio_library: 'Audio Library',
  self_recorded: 'Self-Recorded',
  public_media: 'Public Media',
  creations: 'Creations',
};

const EMPTY_DRAFT: Draft = {
  title: '',
  description: '',
  category: 'music_videos',
  media_type: 'embed',
  storage_path: '',
  external_url: '',
  embed_url: '',
  thumbnail_url: '',
  status: 'draft',
  sort_order: 0,
};

export function MediaManager({ category, title, subtitle }: { category: MediaCategory; title: string; subtitle: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.list<MediaItem>('media_items', { column: 'category', value: category, orderColumn: 'sort_order', ascending: true })
      .then(setItems)
      .catch((e) => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [category]);

  const startNew = () => setEditing({ ...EMPTY_DRAFT, category });
  const startEdit = (m: MediaItem) =>
    setEditing({
      id: m.id,
      title: m.title,
      description: m.description || '',
      category: m.category,
      media_type: m.media_type,
      storage_path: m.storage_path || '',
      external_url: m.external_url || '',
      embed_url: m.embed_url || '',
      thumbnail_url: m.thumbnail_url || '',
      status: m.status,
      sort_order: m.sort_order,
    });

  const onUploaded = (url: string, path: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      media_type: 'native',
      external_url: url,
      storage_path: path,
      embed_url: '',
    });
    toast('File uploaded. Save to record it.');
  };

  const save = async (overrideStatus?: 'draft' | 'published') => {
    if (!editing) return;
    if (!editing.title.trim()) return toast('Title is required.', 'error');
    const status = overrideStatus || editing.status;

    if (editing.media_type === 'embed' && !editing.embed_url) return toast('Embed URL is required for embedded media.', 'error');
    if (editing.media_type === 'native' && !editing.external_url && !editing.storage_path) return toast('Please upload a file or provide a direct media URL.', 'error');

    if (editing.media_type === 'embed' && editing.embed_url && !isEmbeddable(editing.embed_url)) {
      return toast('That URL does not look like an embeddable player. Try a YouTube, Vimeo, SoundCloud, or Spotify link.', 'error');
    }

    setSaving(true);
    const row = {
      title: editing.title.trim(),
      description: editing.description || null,
      category: editing.category,
      media_type: editing.media_type,
      storage_path: editing.storage_path || null,
      external_url: editing.external_url || null,
      embed_url: editing.embed_url || null,
      thumbnail_url: editing.thumbnail_url || null,
      status,
      sort_order: editing.sort_order,
    };
    try {
      if (editing.id) {
        await adminApi.update<MediaItem>('media_items', editing.id, row);
        toast('Media updated.');
      } else {
        await adminApi.create<MediaItem>('media_items', row);
        toast('Media created.');
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
      await adminApi.remove('media_items', id);
      toast('Media deleted.');
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
          title={editing.id ? 'Edit Media' : 'New Media'}
          subtitle={`Category: ${CATEGORY_LABELS[editing.category]} — attributed as Published by Love Parekh.`}
          action={
            <div className="flex gap-2">
              <ActionButton variant="ghost" onClick={() => setEditing(null)}><X size={15} /> Cancel</ActionButton>
              <ActionButton variant="ghost" loading={saving} onClick={() => save('draft')}><SaveIcon size={15} /> Draft</ActionButton>
              <ActionButton loading={saving} onClick={() => save('published')}><Save size={15} /> Publish</ActionButton>
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <Field label="Title">
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="aura-input" placeholder="Media title" />
            </Field>
            <Field label="Description">
              <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={4} className="aura-input resize-none" placeholder="A short description…" />
            </Field>

            <div className="glass-card p-5 space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing({ ...editing, media_type: 'embed' })}
                  className={`flex-1 px-4 py-3 rounded-xl border text-sm transition ${editing.media_type === 'embed' ? 'border-aura-400/40 bg-aura-500/10 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}
                >
                  <LinkIcon size={14} className="inline mr-2" /> Embed link (YouTube/Vimeo/SoundCloud/Spotify)
                </button>
                <button
                  onClick={() => setEditing({ ...editing, media_type: 'native' })}
                  className={`flex-1 px-4 py-3 rounded-xl border text-sm transition ${editing.media_type === 'native' ? 'border-aura-400/40 bg-aura-500/10 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}
                >
                  <UploadIcon size={14} className="inline mr-2" /> Upload / direct file URL
                </button>
              </div>

              {editing.media_type === 'embed' ? (
                <Field label="Embed URL" hint="Paste a YouTube, Vimeo, SoundCloud, or Spotify link — it will be converted automatically.">
                  <input value={editing.embed_url} onChange={(e) => setEditing({ ...editing, embed_url: e.target.value })} className="aura-input" placeholder="https://youtube.com/watch?v=…" />
                  {editing.embed_url && isEmbeddable(editing.embed_url) && (
                    <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                      <iframe src={toEmbedUrl(editing.embed_url).src} className="h-full w-full" title="preview" frameBorder={0} allowFullScreen />
                    </div>
                  )}
                </Field>
              ) : (
                <div className="space-y-4">
                  {editing.external_url && (
                    <Field label="Current file">
                      <div className="flex items-center gap-2 glass-card p-3">
                        <ExternalLink size={14} className="text-aura-200" />
                        <a href={editing.external_url} target="_blank" rel="noreferrer" className="text-xs text-slate-300 truncate hover:text-aura-200">{editing.external_url}</a>
                      </div>
                    </Field>
                  )}
                  <div className="border border-dashed border-white/15 rounded-xl">
                    <MediaUpload onUploaded={onUploaded} compact />
                  </div>
                  <Field label="Or paste a direct media URL" hint="A direct link to an .mp4, .mp3, .wav, .ogg, or other playable file.">
                    <input value={editing.external_url || ''} onChange={(e) => setEditing({ ...editing, external_url: e.target.value, storage_path: e.target.value ? '' : editing.storage_path })} className="aura-input" placeholder="https://…/video.mp4" />
                  </Field>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="glass-card p-5 space-y-4">
              <Field label="Thumbnail URL" hint="Optional — shown as poster for native videos.">
                <input value={editing.thumbnail_url} onChange={(e) => setEditing({ ...editing, thumbnail_url: e.target.value })} className="aura-input" placeholder="https://…" />
              </Field>
              <Field label="Sort order" hint="Lower numbers appear first.">
                <input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) || 0 })} className="aura-input" />
              </Field>
              <Field label="Status">
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as 'draft' | 'published' })} className="aura-input">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs uppercase tracking-widest text-aura-200/70 mb-2">Attribution</p>
              <p className="font-display text-lg text-white">Published by Love Parekh</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title={title} subtitle={subtitle} action={<ActionButton onClick={startNew}><Plus size={15} /> Add media</ActionButton>} />
      {loading ? (
        <Spinner label="Loading media…" />
      ) : items.length === 0 ? (
        <EmptyAdmin title="Nothing here yet" hint="Add embedded links or upload files to populate this section." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <div key={m.id} className="glass-card overflow-hidden hover:border-aura-400/30 transition">
              <div className="h-32 bg-ink-800 grid place-items-center relative">
                {m.thumbnail_url ? (
                  <img src={m.thumbnail_url} alt={m.title} className="h-full w-full object-cover" />
                ) : (
                  <Film size={24} className="text-slate-600" />
                )}
                <span className="absolute top-2 right-2">{m.media_type === 'embed' ? <LinkIcon size={12} className="text-aura-200" /> : <UploadIcon size={12} className="text-neon-blue" />}</span>
              </div>
              <div className="p-4">
                <h3 className="font-display text-base text-white truncate">{m.title}</h3>
                <p className="text-xs text-slate-500 truncate">{m.description || 'No description'}</p>
                <div className="mt-2 flex items-center justify-between">
                  <StatusBadge status={m.status} />
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(m)} className="h-8 w-8 grid place-items-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5" aria-label="Edit"><Pencil size={14} /></button>
                    <button onClick={() => setConfirmDelete(m.id)} className="h-8 w-8 grid place-items-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10" aria-label="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog open={confirmDelete !== null} title="Delete media?" message="This cannot be undone." onConfirm={() => confirmDelete && del(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
