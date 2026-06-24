import { useEffect, useState } from 'react';
import { adminTeamData, type AIAgent } from '../../lib/agents';
import { AdminHeader, ActionButton, Spinner, toast, Field } from './ui';
import { Save, Brain, Crown, Edit3, Shield, Sparkles, Send, Search, FileText, Quote } from 'lucide-react';

const AGENT_ICONS: Record<string, typeof Brain> = {
  'aura-director': Crown,
  'aura-scribe': FileText,
  'aura-voice': Quote,
  'aura-curator': Brain,
  'aura-bard': Edit3,
  'aura-researcher': Search,
  'aura-titlesmith': Sparkles,
  'aura-editor': Edit3,
  'aura-warden': Shield,
  'aura-publisher': Send,
};

const TIER_LABELS: Record<number, string> = { 1: 'Director', 2: 'Specialist', 3: 'Gate' };

const TIER_COLORS: Record<number, string> = { 1: '#3df0ff', 2: '#ee9bff', 3: '#fbbf24' };

export function AgentStudio() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [editing, setEditing] = useState<AIAgent | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminTeamData.agents()
      .then(setAgents)
      .catch(e => toast(e instanceof Error ? e.message : String(e), 'error'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await adminTeamData.updateAgent(editing.slug, {
        system_prompt: editing.system_prompt,
        model: editing.model,
        cadence_cron: editing.cadence_cron,
        active: editing.active,
      });
      toast('Agent updated.');
      setAgents(a => a.map(ag => ag.slug === editing.slug ? editing : ag));
      setEditing(null);
    } catch (e) { toast(e instanceof Error ? e.message : String(e), 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner label="Loading agents…" />;

  if (editing) {
    return (
      <div>
        <AdminHeader
          title={`Configure: ${editing.name}`}
          subtitle={editing.role + ' · ' + editing.specialty}
          action={(
            <div className="flex gap-2">
              <ActionButton onClick={() => setEditing(null)}>Cancel</ActionButton>
              <ActionButton loading={saving} onClick={save}><Save size={15} /> Save</ActionButton>
            </div>
          )}
        />
        <div className="max-w-2xl space-y-4">
          <Field label="System prompt" hint="This is the persona and instructions the agent follows.">
            <textarea value={editing.system_prompt} onChange={(e) => setEditing({ ...editing, system_prompt: e.target.value })} rows={8} className="aura-input resize-none font-mono text-xs" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Model">
              <select value={editing.model} onChange={(e) => setEditing({ ...editing, model: e.target.value })} className="aura-input">
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gpt-4o-mini">GPT-4o mini</option>
                <option value="gpt-4o">GPT-4o</option>
              </select>
            </Field>
            <Field label="Cadence (cron)" hint="When this agent wakes up. Leave empty for on-demand only.">
              <input value={editing.cadence_cron || ''} onChange={(e) => setEditing({ ...editing, cadence_cron: e.target.value || null })} className="aura-input" placeholder="0 9 * * 1 (every Monday 9am)" />
            </Field>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => setEditing({ ...editing, active: !editing.active })}
              className={`relative w-11 h-6 rounded-full transition-colors ${editing.active ? 'bg-emerald-500' : 'bg-white/10'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${editing.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-sm text-white/80">{editing.active ? 'Active' : 'Inactive'}</span>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="Agent Studio" subtitle="Your AI team. Configure each agent's persona, model, and cadence." />
      <div className="grid md:grid-cols-2 gap-4">
        {agents.map(agent => {
          const Icon = AGENT_ICONS[agent.slug] || Brain;
          const color = TIER_COLORS[agent.tier] || '#3df0ff';
          return (
            <div key={agent.slug} className="glass-card p-5 hover:bg-white/[0.04] transition-all cursor-pointer" onClick={() => setEditing(agent)}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}33` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white/90">{agent.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full uppercase" style={{ background: `${color}22`, color }}>{TIER_LABELS[agent.tier]}</span>
                    {!agent.active && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">Off</span>}
                  </div>
                  <div className="text-xs text-slate-500">{agent.role} · {agent.specialty}</div>
                </div>
              </div>
              <p className="text-xs text-white/40 line-clamp-2">{agent.system_prompt.slice(0, 120)}…</p>
              <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-500">
                <span>{agent.model}</span>
                {agent.cadence_cron && <span>· cron: {agent.cadence_cron}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
