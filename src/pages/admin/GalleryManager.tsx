import { useEffect, useState } from 'react';
import { adminApi } from '../../lib/adminApi';
import { STORAGE_BUCKET } from '../../lib/adminApi';
import { type GalleryImage } from '../../lib/adminApi';
import { AdminHeader, StatusBadge, ConfirmDialog, ActionButton, EmptyAdmin, Spinner, toast, Field } from './ui';
import { Plus, Pencil, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';
import { MediaUpload } from './MediaUpload';
import { supabase } from '../../lib/supabase';
type Draft = { id?: string; title: string; description: string; image_url: string; storage_path: string; category: string; status: 'draft' | 'published'; sort_order: number };

const EMPTY: Draft = {
  title: '',
  description: '',
  image_url: '',
  storage_path: '',
  category: 'general',
  status: 'draft',
  sort_order: 0,
};

export function GalleryManager() {
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.list<GalleryImage>('gallery_images', { orderColumn: 'sort_order', ascending: true })
      .then(setItems)
      .catch((e) => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const onUploaded = (url: string, path: string) => {
    if (!editing) return;
    setEditing({ ...editing, image_url: url, storage_path: path });
    toast('Image uploaded. Save to record it.');
  };

  const save = async (overrideStatus?: 'draft' | 'published') => {
    if (!editing) return;
    if (!editing.image_url.trim()) return toast('Image URL or upload is required.', 'error');
    setSaving(true);
    const status = overrideStatus || editing.status;
    const row = {
      title: editing.title || null,
      description: editing.description || null,
      image_url: editing.image_url.trim(),
      storage_path: editing.storage_path || null,
      category: editing.category,
      status,
      sort_order: editing.sort_order,
    };
    try {
      if (editing.id) {
        await adminApi.update<GalleryImage>('gallery_images', editing.id, row);
        toast('Image updated.');
      } else {
        await adminApi.create<GalleryImage>('gallery_images', row);
        toast('Image created.');
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
    const item = items.find((i) => i.id === id);
    try {
      await adminApi.remove('gallery_images', id);
      if (item?.storage_path) {
        await supabase.storage.from(STORAGE_BUCKET).remove([item.storage_path]).catch(() => {});
      }
      toast('Image deleted.');
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
          title={editing.id ? 'Edit Image' : 'Add Image'}
          subtitle="Attributed as Published by Love Parekh."
          action={
            <div className="flex gap-2">
              <ActionButton variant="ghost" onClick={() => setEditing(null)}><X size={15} /> Cancel</ActionButton>
              <ActionButton variant="ghost" loading={saving} onClick={() => save('draft')}>Draft</ActionButton>
              <ActionButton loading={saving} onClick={() => save('published')}><Save size={15} /> Publish</ActionButton>
            </div>
          }
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <Field label="Title">
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="aura-input" placeholder="Image title" />
            </Field>
            <Field label="Description">
              <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="aura-input resize-none" placeholder="Optional caption" />
            </Field>
            <Field label="Image URL" hint="Or upload a file below — the URL will be filled automatically.">
              <input value={editing.image_url || ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value, storage_path: e.target.value ? '' : editing.storage_path })} className="aura-input" placeholder="https://…" />
            </Field>
            <div className="glass-card p-4">
              <MediaUpload compact onUploaded={onUploaded} />
            </div>
          </div>
          <div className="space-y-5">
            {editing.image_url && (
              <div className="glass-card p-3">
                <div className="aspect-square rounded-xl overflow-hidden border border-white/10">
                  <img src={editing.image_url} alt="preview" className="h-full w-full object-cover" />
                </div>
              </div>
            )}
            <div className="glass-card p-5 space-y-4">
              <Field label="Category">
                <input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="aura-input" placeholder="general" />
              </Field>
              <Field label="Sort order">
                <input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) || 0 })} className="aura-input" />
              </Field>
              <Field label="Status">
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as 'draft' | 'published' })} className="aura-input">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="Gallery" subtitle={`${items.length} images`} action={<ActionButton onClick={() => setEditing({ ...EMPTY })}><Plus size={15} /> Add image</ActionButton>} />
      {loading ? (
        <Spinner label="Loading gallery…" />
      ) : items.length === 0 ? (
        <EmptyAdmin title="No images yet" hint="Upload or link images to build the gallery." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((g) => (
            <div key={g.id} className="glass-card overflow-hidden hover:border-aura-400/30 transition">
              <div className="aspect-square bg-ink-800">
                {g.image_url ? (
                  <img src={g.image_url} alt={g.title || ''} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center"><ImageIcon size={22} className="text-slate-600" /></div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm text-white truncate">{g.title || 'Untitled'}</p>
                <div className="mt-1 flex items-center justify-between">
                  <StatusBadge status={g.status} />
                  <div className="flex gap-1">
                    <button onClick={() => setEditing({ id: g.id, title: g.title || '', description: g.description || '', image_url: g.image_url, storage_path: g.storage_path || '', category: g.category, status: g.status, sort_order: g.sort_order })} className="h-7 w-7 grid place-items-center rounded text-slate-400 hover:text-white hover:bg-white/5"><Pencil size={12} /></button>
                    <button onClick={() => setConfirmDelete(g.id)} className="h-7 w-7 grid place-items-center rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog open={confirmDelete !== null} title="Delete image?" message="This cannot be undone." onConfirm={() => confirmDelete && del(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
