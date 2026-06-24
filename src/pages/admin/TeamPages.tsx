import { useEffect, useState } from 'react';
import { adminTeamData, type ContentCalendarEntry, type TeamActivity } from '../../lib/agents';
import { AdminHeader, Spinner, toast } from './ui';
import { Calendar, Activity, Brain, Edit3, Shield, Send, Sparkles, Search, FileText, Quote } from 'lucide-react';

const AGENT_ICONS: Record<string, typeof Brain> = {
  'aura-director': Brain,
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

const STATUS_COLORS: Record<string, string> = {
  planned: '#3df0ff', assigned: '#ee9bff', drafted: '#fbbf24', reviewed: '#8b5cff', published: '#34d399', cancelled: '#f87171',
  pending: '#3df0ff', running: '#fbbf24', complete: '#34d399', failed: '#f87171', rejected: '#f87171',
  created_run: '#3df0ff', edited: '#ee9bff', gated: '#ff3df1',
};

export function ContentCalendarPage() {
  const [entries, setEntries] = useState<ContentCalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminTeamData.calendarEntries()
      .then(setEntries)
      .catch(e => toast(e instanceof Error ? e.message : String(e), 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading calendar…" />;

  // Group by month
  const byMonth: Record<string, ContentCalendarEntry[]> = {};
  entries.forEach(e => {
    const month = new Date(e.scheduled_date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(e);
  });

  return (
    <div>
      <AdminHeader title="Content Calendar" subtitle="Scheduled, drafted, and published content across all agents." />
      {entries.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Calendar size={32} className="mx-auto mb-3 opacity-30" />
          <p>No calendar entries yet.</p>
          <p className="text-xs mt-1">The Director will create entries when it runs.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byMonth).map(([month, items]) => (
            <div key={month}>
              <h3 className="text-sm uppercase tracking-widest text-aura-200/60 mb-2">{month}</h3>
              <div className="space-y-2">
                {items.map(e => {
                  const color = STATUS_COLORS[e.status] || '#3df0ff';
                  return (
                    <div key={e.id} className="glass-card p-3 flex items-center gap-3">
                      <div className="text-center w-12 flex-shrink-0">
                        <div className="text-lg font-display text-white/80">{new Date(e.scheduled_date).getDate()}</div>
                        <div className="text-[9px] text-slate-500 uppercase">{new Date(e.scheduled_date).toLocaleString('default', { weekday: 'short' })}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white/80 truncate">{e.title}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span className="uppercase">{e.content_type}</span>
                          {e.assigned_agent && <span>· {e.assigned_agent}</span>}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>{e.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TeamActivityLog() {
  const [log, setLog] = useState<TeamActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminTeamData.activityLog()
      .then(setLog)
      .catch(e => toast(e instanceof Error ? e.message : String(e), 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading activity…" />;

  return (
    <div>
      <AdminHeader title="Team Activity Log" subtitle="Every action every agent has taken — fully auditable." />
      {log.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Activity size={32} className="mx-auto mb-3 opacity-30" />
          <p>No activity yet.</p>
          <p className="text-xs mt-1">Run the Director or a pipeline to see agent actions here.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {log.map(entry => {
            const Icon = AGENT_ICONS[entry.agent_slug] || Brain;
            const color = STATUS_COLORS[entry.action] || '#3df0ff';
            return (
              <div key={entry.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                  <Icon size={12} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-white/70">{entry.agent_slug}</span>
                  <span className="text-sm text-slate-400"> · {entry.action}</span>
                  {entry.entity_type && <span className="text-[10px] text-slate-500"> · {entry.entity_type}</span>}
                </div>
                <span className="text-[10px] text-slate-500 flex-shrink-0">{new Date(entry.created_at).toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
