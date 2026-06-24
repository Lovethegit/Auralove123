import { useEffect, useState } from 'react';
import { adminApi, type SelfNote } from '../../lib/adminApi';
import { AdminHeader, ActionButton, EmptyAdmin, Spinner, toast, ConfirmDialog } from './ui';
import { Plus, Save, Trash2, Pin, Pencil, X, Lock } from 'lucide-react';

type Draft = { id?: string; title: string; body: string; pinned: boolean };

const EMPTY: Draft = { title: '', body: '', pinned: false };
void EMPTY;

export function SelfSectionManager() {
  const [items, setItems] = useState<SelfNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.list<SelfNote>('self_notes', { column: 'pinned', value: true, orderColumn: 'updated_at', ascending: false })
      .then((pinned) => adminApi.list<SelfNote>('self_notes', { orderColumn: 'updated_at', ascending: false })
        .then((all) => {
          // pinned first, then the rest
          const pinnedIds = new Set(pinned.map((p) => p.id));
          const sorted = [...all].sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
          });
          void pinnedIds;
          return sorted;
        }))
      .then(setItems)
      .catch((e) => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.body.trim()) return toast('Note body is required.', 'error');
    setSaving(true);
    const row = { title: editing.title || null, body: editing.body.trim(), pinned: editing.pinned };
    try {
      if (editing.id) {
        await adminApi.update<SelfNote>('self_notes', editing.id, row);
        toast('Note updated.');
      } else {
        await adminApi.create<SelfNote>('self_notes', row);
        toast('Note saved.');
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
      await adminApi.remove('self_notes', id);
      toast('Note deleted.');
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <AdminHeader
        title="Self-Section"
        subtitle="Private notes — only visible inside the dashboard. Not shown publicly."
        action={editing ? (
          <div className="flex gap-2">
            <ActionButton variant="ghost" onClick={() => setEditing(null)}><X size={15} /> Cancel</ActionButton>
            <ActionButton loading={saving} onClick={save}><Save size={15} /> Save note</ActionButton>
          </div>
        ) : (
          <ActionButton onClick={() => setEditing({ ...EMPTY })}><Plus size={15} /> New note</ActionButton>
        )}
      />

      <div className="mb-6 glass-card p-4 flex items-center gap-3 border-aura-400/20 bg-aura-500/[0.04]">
        <Lock size={16} className="text-aura-200" />
        <p className="text-sm text-slate-300">These notes are never published. They exist only for you, here in the atelier.</p>
      </div>

      {editing ? (
        <div className="glass-panel p-6 space-y-5">
          <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="aura-input" placeholder="Note title (optional)" />
          <textarea value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} rows={10} className="aura-input resize-y" placeholder="Write your private thoughts…" autoFocus />
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" checked={editing.pinned} onChange={(e) => setEditing({ ...editing, pinned: e.target.checked })} className="h-4 w-4 accent-aura-500" />
            <Pin size={14} /> Pin to the top
          </label>
        </div>
      ) : loading ? (
        <Spinner label="Loading notes…" />
      ) : items.length === 0 ? (
        <EmptyAdmin title="No notes yet" hint="Capture ideas, reminders, or reflections here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((n) => (
            <div key={n.id} className={`glass-card p-5 ${n.pinned ? 'border-aura-400/30' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                {n.pinned && <Pin size={14} className="text-aura-200 mt-1" />}
                <div className="flex gap-1 ml-auto">
                  <button onClick={() => setEditing({ id: n.id, title: n.title || '', body: n.body, pinned: n.pinned })} className="h-7 w-7 grid place-items-center rounded text-slate-400 hover:text-white hover:bg-white/5"><Pencil size={12} /></button>
                  <button onClick={() => setConfirmDelete(n.id)} className="h-7 w-7 grid place-items-center rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10"><Trash2 size={12} /></button>
                </div>
              </div>
              {n.title && <h3 className="font-display text-lg text-white mt-1">{n.title}</h3>}
              <p className="mt-2 text-sm text-slate-300 whitespace-pre-wrap line-clamp-[12]">{n.body}</p>
              <p className="mt-3 text-xs text-slate-500">{new Date(n.updated_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={confirmDelete !== null} title="Delete note?" message="This cannot be undone." onConfirm={() => confirmDelete && del(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
