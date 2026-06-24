import { useEffect, useState } from 'react';
import { adminApi, type AuraEvent } from '../../lib/adminApi';
import { AdminHeader, StatusBadge, ConfirmDialog, ActionButton, EmptyAdmin, Spinner, toast, Field } from './ui';
import { Plus, Pencil, Trash2, Save, X, Calendar } from 'lucide-react';

type Draft = { id?: string; title: string; description: string; event_date: string; location: string; image_url: string; status: 'draft' | 'published' };

const EMPTY: Draft = {
  title: '',
  description: '',
  event_date: '',
  location: '',
  image_url: '',
  status: 'draft',
};

export function EventsManager() {
  const [items, setItems] = useState<AuraEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.list<AuraEvent>('events', { orderColumn: 'event_date', ascending: true })
      .then(setItems)
      .catch((e) => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async (overrideStatus?: 'draft' | 'published') => {
    if (!editing) return;
    if (!editing.title.trim()) return toast('Title is required.', 'error');
    setSaving(true);
    const status = overrideStatus || editing.status;
    const row = {
      title: editing.title.trim(),
      description: editing.description || null,
      event_date: editing.event_date || null,
      location: editing.location || null,
      image_url: editing.image_url || null,
      status,
    };
    try {
      if (editing.id) {
        await adminApi.update<AuraEvent>('events', editing.id, row);
        toast('Event updated.');
      } else {
        await adminApi.create<AuraEvent>('events', row);
        toast('Event created.');
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
      await adminApi.remove('events', id);
      toast('Event deleted.');
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
          title={editing.id ? 'Edit Event' : 'New Event'}
          subtitle="Attributed as Published by Love Parekh."
          action={
            <div className="flex gap-2">
              <ActionButton variant="ghost" onClick={() => setEditing(null)}><X size={15} /> Cancel</ActionButton>
              <ActionButton variant="ghost" loading={saving} onClick={() => save('draft')}>Draft</ActionButton>
              <ActionButton loading={saving} onClick={() => save('published')}><Save size={15} /> Publish</ActionButton>
            </div>
          }
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <Field label="Title">
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="aura-input" placeholder="Event title" />
            </Field>
            <Field label="Description">
              <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={4} className="aura-input resize-none" placeholder="What is this event about?" />
            </Field>
          </div>
          <div className="space-y-5">
            <div className="glass-card p-5 space-y-4">
              <Field label="Date">
                <input type="date" value={editing.event_date || ''} onChange={(e) => setEditing({ ...editing, event_date: e.target.value })} className="aura-input" />
              </Field>
              <Field label="Location">
                <input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className="aura-input" placeholder="City / venue / online" />
              </Field>
              <Field label="Image URL">
                <input value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="aura-input" placeholder="https://…" />
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
      <AdminHeader title="Events" subtitle={`${items.length} events`} action={<ActionButton onClick={() => setEditing({ ...EMPTY })}><Plus size={15} /> New event</ActionButton>} />
      {loading ? (
        <Spinner label="Loading events…" />
      ) : items.length === 0 ? (
        <EmptyAdmin title="No events yet" hint="Create an event to share with your audience." />
      ) : (
        <div className="space-y-3">
          {items.map((e) => (
            <div key={e.id} className="glass-card p-5 flex items-center gap-4 hover:border-aura-400/30 transition">
              {e.event_date && (
                <div className="shrink-0 text-center w-16 py-2 rounded-xl bg-aura-500/10 border border-aura-400/20">
                  <p className="font-display text-2xl text-white">{new Date(e.event_date).getDate()}</p>
                  <p className="text-[10px] uppercase text-aura-200">{new Date(e.event_date).toLocaleDateString(undefined, { month: 'short' })}</p>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg text-white truncate">{e.title}</h3>
                {e.location && <p className="text-xs text-slate-500 truncate">{e.location}</p>}
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={e.status} />
                  <span className="text-xs text-slate-500 inline-flex items-center gap-1"><Calendar size={11} /> {e.event_date ? new Date(e.event_date).toLocaleDateString() : 'No date'}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing({ id: e.id, title: e.title, description: e.description || '', event_date: e.event_date || '', location: e.location || '', image_url: e.image_url || '', status: e.status })} className="h-9 w-9 grid place-items-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5"><Pencil size={16} /></button>
                <button onClick={() => setConfirmDelete(e.id)} className="h-9 w-9 grid place-items-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog open={confirmDelete !== null} title="Delete event?" message="This cannot be undone." onConfirm={() => confirmDelete && del(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
