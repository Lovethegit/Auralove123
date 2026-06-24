import { useEffect, useState } from 'react';
import { adminTeamData, type SerializedChapter, type TimeCapsule, type ScheduledDrop } from '../../lib/agents';
import { AdminHeader, ActionButton, Spinner, toast, Field } from './ui';
import { Save, Plus, Trash2, Edit3, Clock, Calendar } from 'lucide-react';

// ===== Loom Manager =====

export function LoomManager() {
  const [chapters, setChapters] = useState<SerializedChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<SerializedChapter> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const data = await adminTeamData.chapters(); setChapters(data); }
    catch (e) { toast(e instanceof Error ? e.message : String(e), 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await adminTeamData.upsertChapter({
        id: editing.id,
        title: editing.title || 'Untitled',
        chapter_number: editing.chapter_number || chapters.length + 1,
        excerpt: editing.excerpt || null,
        body: editing.body || '',
        status: editing.status || 'draft',
        published_at: editing.status === 'published' ? new Date().toISOString() : null,
      });
      toast('Chapter saved.');
      setEditing(null);
      load();
    } catch (e) { toast(e instanceof Error ? e.message : String(e), 'error'); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this chapter?')) return;
    try { await adminTeamData.deleteChapter(id); toast('Deleted.'); load(); }
    catch (e) { toast(e instanceof Error ? e.message : String(e), 'error'); }
  };

  if (loading) return <Spinner label="Loading chapters…" />;

  if (editing) {
    return (
      <div>
        <AdminHeader title={editing.id ? 'Edit Chapter' : 'New Chapter'} action={(
          <div className="flex gap-2">
            <ActionButton onClick={() => setEditing(null)}>Cancel</ActionButton>
            <ActionButton loading={saving} onClick={save}><Save size={15} /> Save</ActionButton>
          </div>
        )} />
        <div className="max-w-2xl space-y-4">
          <Field label="Title"><input value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} className="aura-input" /></Field>
          <Field label="Chapter number"><input type="number" value={editing.chapter_number || ''} onChange={e => setEditing({ ...editing, chapter_number: parseInt(e.target.value) || 1 })} className="aura-input" /></Field>
          <Field label="Excerpt"><textarea value={editing.excerpt || ''} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} rows={2} className="aura-input resize-none" /></Field>
          <Field label="Body"><textarea value={editing.body || ''} onChange={e => setEditing({ ...editing, body: e.target.value })} rows={12} className="aura-input resize-none" /></Field>
          <Field label="Status"><select value={editing.status || 'draft'} onChange={e => setEditing({ ...editing, status: e.target.value as 'draft' | 'published' })} className="aura-input"><option value="draft">Draft</option><option value="published">Published</option></select></Field>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="The Loom" subtitle="Serialized story chapters." action={<ActionButton onClick={() => setEditing({})}><Plus size={15} /> New Chapter</ActionButton>} />
      {chapters.length === 0 ? (
        <div className="text-center py-12 text-slate-500"><p>No chapters yet.</p></div>
      ) : (
        <div className="space-y-2">
          {chapters.map(ch => (
            <div key={ch.id} className="glass-card p-3 flex items-center gap-3">
              <div className="text-2xl font-display text-white/20 w-8 text-center">{ch.chapter_number}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white/80 truncate">{ch.title}</div>
                <div className="text-[10px] text-slate-500">{ch.status}</div>
              </div>
              <button onClick={() => setEditing(ch)} className="text-white/40 hover:text-white"><Edit3 size={14} /></button>
              <button onClick={() => del(ch.id)} className="text-red-400/60 hover:text-red-400"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Capsule Manager =====

export function CapsuleManager() {
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<TimeCapsule> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const data = await adminTeamData.capsules(); setCapsules(data); }
    catch (e) { toast(e instanceof Error ? e.message : String(e), 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await adminTeamData.upsertCapsule({
        id: editing.id,
        title: editing.title || 'Untitled',
        body: editing.body || '',
        capsule_type: editing.capsule_type || 'message',
        unlock_date: editing.unlock_date || new Date().toISOString().split('T')[0],
        status: editing.status || 'sealed',
      });
      toast('Capsule saved.');
      setEditing(null);
      load();
    } catch (e) { toast(e instanceof Error ? e.message : String(e), 'error'); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this capsule?')) return;
    try { await adminTeamData.deleteCapsule(id); toast('Deleted.'); load(); }
    catch (e) { toast(e instanceof Error ? e.message : String(e), 'error'); }
  };

  if (loading) return <Spinner label="Loading capsules…" />;

  if (editing) {
    return (
      <div>
        <AdminHeader title={editing.id ? 'Edit Capsule' : 'New Capsule'} action={(
          <div className="flex gap-2">
            <ActionButton onClick={() => setEditing(null)}>Cancel</ActionButton>
            <ActionButton loading={saving} onClick={save}><Save size={15} /> Save</ActionButton>
          </div>
        )} />
        <div className="max-w-2xl space-y-4">
          <Field label="Title"><input value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} className="aura-input" /></Field>
          <Field label="Body"><textarea value={editing.body || ''} onChange={e => setEditing({ ...editing, body: e.target.value })} rows={8} className="aura-input resize-none" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type"><select value={editing.capsule_type || 'message'} onChange={e => setEditing({ ...editing, capsule_type: e.target.value })} className="aura-input"><option value="message">Message</option><option value="quote">Quote</option><option value="audio">Audio</option><option value="video">Video</option><option value="image">Image</option></select></Field>
            <Field label="Unlock date"><input type="date" value={editing.unlock_date || ''} onChange={e => setEditing({ ...editing, unlock_date: e.target.value })} className="aura-input" /></Field>
          </div>
          <Field label="Status"><select value={editing.status || 'sealed'} onChange={e => setEditing({ ...editing, status: e.target.value as 'sealed' | 'unlocked' })} className="aura-input"><option value="sealed">Sealed</option><option value="unlocked">Unlocked</option></select></Field>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="Time Capsules" subtitle="Sealed content that unlocks on future dates." action={<ActionButton onClick={() => setEditing({})}><Plus size={15} /> New Capsule</ActionButton>} />
      {capsules.length === 0 ? (
        <div className="text-center py-12 text-slate-500"><Clock size={28} className="mx-auto mb-2 opacity-30" /><p>No capsules yet.</p></div>
      ) : (
        <div className="space-y-2">
          {capsules.map(c => {
            const unlocked = c.status === 'unlocked' || new Date(c.unlock_date) <= new Date();
            return (
              <div key={c.id} className="glass-card p-3 flex items-center gap-3">
                <Clock size={16} className={unlocked ? 'text-emerald-400' : 'text-amber-400'} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/80 truncate">{c.title}</div>
                  <div className="text-[10px] text-slate-500">Unlocks {new Date(c.unlock_date).toLocaleDateString()}</div>
                </div>
                <button onClick={() => setEditing(c)} className="text-white/40 hover:text-white"><Edit3 size={14} /></button>
                <button onClick={() => del(c.id)} className="text-red-400/60 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===== Drop Manager =====

export function DropManager() {
  const [drops, setDrops] = useState<ScheduledDrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<ScheduledDrop> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const data = await adminTeamData.drops(); setDrops(data); }
    catch (e) { toast(e instanceof Error ? e.message : String(e), 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await adminTeamData.upsertDrop({
        id: editing.id,
        title: editing.title || 'Untitled',
        description: editing.description || null,
        drop_type: editing.drop_type || 'blog',
        drop_date: editing.drop_date || new Date().toISOString(),
        status: editing.status || 'scheduled',
        accent_hex: editing.accent_hex || '#3df0ff',
      });
      toast('Drop saved.');
      setEditing(null);
      load();
    } catch (e) { toast(e instanceof Error ? e.message : String(e), 'error'); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this drop?')) return;
    try { await adminTeamData.deleteDrop(id); toast('Deleted.'); load(); }
    catch (e) { toast(e instanceof Error ? e.message : String(e), 'error'); }
  };

  if (loading) return <Spinner label="Loading drops…" />;

  if (editing) {
    return (
      <div>
        <AdminHeader title={editing.id ? 'Edit Drop' : 'New Drop'} action={(
          <div className="flex gap-2">
            <ActionButton onClick={() => setEditing(null)}>Cancel</ActionButton>
            <ActionButton loading={saving} onClick={save}><Save size={15} /> Save</ActionButton>
          </div>
        )} />
        <div className="max-w-2xl space-y-4">
          <Field label="Title"><input value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} className="aura-input" /></Field>
          <Field label="Description"><textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3} className="aura-input resize-none" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type"><select value={editing.drop_type || 'blog'} onChange={e => setEditing({ ...editing, drop_type: e.target.value as ScheduledDrop['drop_type'] })} className="aura-input"><option value="blog">Blog</option><option value="media">Media</option><option value="quote">Quote</option><option value="chapter">Chapter</option><option value="event">Event</option><option value="special">Special</option></select></Field>
            <Field label="Drop date & time"><input type="datetime-local" value={editing.drop_date ? new Date(editing.drop_date).toISOString().slice(0, 16) : ''} onChange={e => setEditing({ ...editing, drop_date: new Date(e.target.value).toISOString() })} className="aura-input" /></Field>
          </div>
          <Field label="Accent color"><input type="color" value={editing.accent_hex || '#3df0ff'} onChange={e => setEditing({ ...editing, accent_hex: e.target.value })} className="w-12 h-10 rounded cursor-pointer bg-transparent border border-white/20" /></Field>
          <Field label="Status"><select value={editing.status || 'scheduled'} onChange={e => setEditing({ ...editing, status: e.target.value as ScheduledDrop['status'] })} className="aura-input"><option value="scheduled">Scheduled</option><option value="live">Live</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></Field>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="Scheduled Drops" subtitle="Timed content releases with countdown timers." action={<ActionButton onClick={() => setEditing({})}><Plus size={15} /> New Drop</ActionButton>} />
      {drops.length === 0 ? (
        <div className="text-center py-12 text-slate-500"><Calendar size={28} className="mx-auto mb-2 opacity-30" /><p>No drops yet.</p></div>
      ) : (
        <div className="space-y-2">
          {drops.map(d => {
            const isLive = new Date(d.drop_date) <= new Date();
            return (
              <div key={d.id} className="glass-card p-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: isLive ? '#34d399' : d.accent_hex || '#3df0ff' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/80 truncate">{d.title}</div>
                  <div className="text-[10px] text-slate-500">{d.drop_type} · {new Date(d.drop_date).toLocaleString()}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: isLive ? '#34d39922' : '#3df0ff22', color: isLive ? '#34d399' : '#3df0ff' }}>{isLive ? 'live' : d.status}</span>
                <button onClick={() => setEditing(d)} className="text-white/40 hover:text-white"><Edit3 size={14} /></button>
                <button onClick={() => del(d.id)} className="text-red-400/60 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
