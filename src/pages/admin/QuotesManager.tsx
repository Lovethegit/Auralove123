import { useEffect, useState } from 'react';
import { adminApi, type Quote } from '../../lib/adminApi';
import { AdminHeader, StatusBadge, ConfirmDialog, ActionButton, EmptyAdmin, Spinner, toast, Field } from './ui';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';

type Draft = { id?: string; text: string; source: string; status: 'draft' | 'published' };

const EMPTY: Draft = { text: '', source: '', status: 'draft' };

export function QuotesManager() {
  const [items, setItems] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.list<Quote>('quotes', { orderColumn: 'created_at', ascending: false })
      .then(setItems)
      .catch((e) => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async (overrideStatus?: 'draft' | 'published') => {
    if (!editing) return;
    if (!editing.text.trim()) return toast('Quote text is required.', 'error');
    setSaving(true);
    const status = overrideStatus || editing.status;
    const row = { text: editing.text.trim(), source: editing.source?.trim() || null, status };
    try {
      if (editing.id) {
        await adminApi.update<Quote>('quotes', editing.id, row);
        toast('Quote updated.');
      } else {
        await adminApi.create<Quote>('quotes', row);
        toast('Quote created.');
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
      await adminApi.remove('quotes', id);
      toast('Quote deleted.');
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
          title={editing.id ? 'Edit Quote' : 'New Quote'}
          subtitle="Attributed as Published by Love Parekh."
          action={
            <div className="flex gap-2">
              <ActionButton variant="ghost" onClick={() => setEditing(null)}><X size={15} /> Cancel</ActionButton>
              <ActionButton variant="ghost" loading={saving} onClick={() => save('draft')}>Draft</ActionButton>
              <ActionButton loading={saving} onClick={() => save('published')}><Save size={15} /> Publish</ActionButton>
            </div>
          }
        />
        <div className="max-w-2xl space-y-5">
          <Field label="Quote text">
            <textarea value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} rows={4} className="aura-input resize-none" placeholder="The quote…" />
          </Field>
          <Field label="Source" hint="Optional — e.g. a book, person, or 'Untitled'.">
            <input value={editing.source} onChange={(e) => setEditing({ ...editing, source: e.target.value })} className="aura-input" placeholder="Source" />
          </Field>
          <Field label="Status">
            <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as 'draft' | 'published' })} className="aura-input">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="Quotes" subtitle={`${items.length} quotes`} action={<ActionButton onClick={() => setEditing({ ...EMPTY })}><Plus size={15} /> New quote</ActionButton>} />
      {loading ? (
        <Spinner label="Loading quotes…" />
      ) : items.length === 0 ? (
        <EmptyAdmin title="No quotes yet" hint="Add one or generate via the AI Studio." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((q) => (
            <div key={q.id} className="glass-card p-5 hover:border-aura-400/30 transition">
              <p className="font-display text-lg text-white leading-relaxed">{q.text}</p>
              {q.source && <p className="mt-2 text-sm text-aura-200">— {q.source}</p>}
              <div className="mt-3 flex items-center justify-between">
                <StatusBadge status={q.status} />
                <div className="flex gap-1">
                  <button onClick={() => setEditing({ id: q.id, text: q.text, source: q.source || '', status: q.status })} className="h-8 w-8 grid place-items-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5"><Pencil size={14} /></button>
                  <button onClick={() => setConfirmDelete(q.id)} className="h-8 w-8 grid place-items-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog open={confirmDelete !== null} title="Delete quote?" message="This cannot be undone." onConfirm={() => confirmDelete && del(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
