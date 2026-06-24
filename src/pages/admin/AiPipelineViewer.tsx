import { useEffect, useState, useCallback } from 'react';
import { adminTeamData, adminOrchestrator, type PipelineRun, type PipelineStep } from '../../lib/agents';
import { AdminHeader, ActionButton, Spinner, toast } from './ui';
import { Play, Check, X, RefreshCw, Brain, Edit3, Shield, Sparkles, Send, Clock } from 'lucide-react';

const STEP_ICONS: Record<string, typeof Brain> = {
  drafting: Brain,
  editing: Edit3,
  gate: Shield,
  polish: Sparkles,
  publishing: Send,
};

const STEP_COLORS: Record<string, string> = {
  initiated: '#3df0ff',
  director: '#3df0ff',
  drafting: '#ee9bff',
  editing: '#fbbf24',
  warden: '#ff3df1',
  titlesmith: '#8b5cff',
  publishing: '#34d399',
  published: '#34d399',
  rejected: '#f87171',
  failed: '#f87171',
  held: '#fbbf24',
};

export function AiPipelineViewer() {
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [directorRunning, setDirectorRunning] = useState(false);
  const [fullCycleRunning, setFullCycleRunning] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await adminTeamData.pipelineRuns();
      setRuns(data);
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadSteps = useCallback(async (runId: string) => {
    setSelected(runId);
    try {
      const data = await adminTeamData.pipelineSteps(runId);
      setSteps(data);
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'error');
    }
  }, []);

  const runPipeline = async () => {
    setRunning(true);
    try {
      const result = await adminOrchestrator.runPipeline({
        topic: prompt('Topic for the AI team to write about?', 'The beauty of impermanence') || 'The beauty of impermanence',
        contentType: 'blog',
        tone: 'poetic, reflective, inspiring',
      });
      if (result.success) {
        toast(result.status === 'held_for_approval' ? 'Draft held for your approval.' : 'Published!');
        load();
      } else if (result.rejected) {
        toast(`Warden rejected: ${result.reason}`, 'error');
        load();
      } else {
        toast(result.error || 'Pipeline failed', 'error');
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'error');
    } finally {
      setRunning(false);
    }
  };

  const runDirector = async () => {
    setDirectorRunning(true);
    try {
      const result = await adminOrchestrator.runDirector();
      if (result.success) {
        toast(`Director created ${result.created?.length || 0} briefs.`);
        load();
      } else {
        toast(result.error || 'Director failed', 'error');
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'error');
    } finally {
      setDirectorRunning(false);
    }
  };

  const runFullCycle = async () => {
    setFullCycleRunning(true);
    try {
      const result = await adminOrchestrator.runFullCycle();
      if (result.success) {
        const published = result.results?.filter((r: any) => r.status === 'published').length || 0;
        const held = result.results?.filter((r: any) => r.status === 'held_for_approval').length || 0;
        const rejected = result.results?.filter((r: any) => r.status === 'rejected').length || 0;
        const failed = result.results?.filter((r: any) => r.status === 'failed').length || 0;
        toast(`Full cycle: ${published} published, ${held} held, ${rejected} rejected, ${failed} failed.`);
        load();
      } else {
        toast(result.error || 'Full cycle failed', 'error');
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'error');
    } finally {
      setFullCycleRunning(false);
    }
  };

  const approve = async (runId: string) => {
    try {
      const result = await adminOrchestrator.approve(runId);
      if (result.success) toast('Published!');
      else toast(result.error || 'Failed', 'error');
      load();
      if (selected === runId) loadSteps(runId);
    } catch (e) { toast(e instanceof Error ? e.message : String(e), 'error'); }
  };

  const reject = async (runId: string) => {
    try {
      await adminOrchestrator.reject(runId);
      toast('Rejected.');
      load();
    } catch (e) { toast(e instanceof Error ? e.message : String(e), 'error'); }
  };

  if (loading) return <Spinner label="Loading pipeline…" />;

  return (
    <div>
      <AdminHeader
        title="AI Pipeline Viewer"
        subtitle="Watch content move through Director → Specialist → Editor → Warden → Publisher in real time."
        action={(
          <div className="flex gap-2">
            <ActionButton onClick={runFullCycle} loading={fullCycleRunning}>
              <Sparkles size={15} /> Run Full Cycle
            </ActionButton>
            <ActionButton onClick={runDirector} loading={directorRunning}>
              <Brain size={15} /> Run Director
            </ActionButton>
            <ActionButton onClick={runPipeline} loading={running}>
              <Play size={15} /> New Pipeline
            </ActionButton>
            <ActionButton onClick={load}>
              <RefreshCw size={15} />
            </ActionButton>
          </div>
        )}
      />
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Runs list */}
        <div className="space-y-2">
          {runs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Brain size={32} className="mx-auto mb-3 opacity-30" />
              <p>No pipeline runs yet.</p>
              <p className="text-xs mt-1">Run the Director or start a new pipeline to see the team work.</p>
            </div>
          ) : (
            runs.map(run => {
              const color = STEP_COLORS[run.current_step] || '#3df0ff';
              const isSelected = selected === run.id;
              return (
                <div
                  key={run.id}
                  className={`glass-card p-3 cursor-pointer transition-all ${isSelected ? 'ring-1' : 'hover:bg-white/5'}`}
                  style={isSelected ? { borderColor: color } : undefined}
                  onClick={() => loadSteps(run.id)}
                >
                  <div className="flex items-center gap-2 justify-between mb-1">
                    <span className="text-sm font-medium text-white/80 truncate flex-1">{run.topic}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>{run.current_step}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="uppercase">{run.content_type}</span>
                    <span>·</span>
                    <span>{new Date(run.created_at).toLocaleString()}</span>
                    {(run.current_step === 'held' || run.current_step === 'titlesmith') && (
                      <div className="flex gap-1 ml-auto">
                        <button onClick={(e) => { e.stopPropagation(); approve(run.id); }} className="text-emerald-400 hover:text-emerald-300"><Check size={12} /></button>
                        <button onClick={(e) => { e.stopPropagation(); reject(run.id); }} className="text-red-400 hover:text-red-300"><X size={12} /></button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Steps timeline */}
        <div>
          {!selected ? (
            <div className="text-center py-12 text-slate-500">
              <Clock size={32} className="mx-auto mb-3 opacity-30" />
              <p>Select a run to see the assembly line.</p>
            </div>
          ) : steps.length === 0 ? (
            <div className="text-center py-12 text-slate-500"><p>No steps recorded yet.</p></div>
          ) : (
            <div className="space-y-2">
              {steps.map((step, idx) => {
                const Icon = STEP_ICONS[step.step_name] || Brain;
                const color = step.status === 'complete' ? '#34d399' : step.status === 'failed' ? '#f87171' : step.status === 'rejected' ? '#f87171' : '#3df0ff';
                return (
                  <div key={step.id} className="glass-card p-4 relative">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
                        <Icon size={14} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white/80 capitalize">{step.step_name}</div>
                        <div className="text-[10px] text-slate-500">{step.agent_slug}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>{step.status}</span>
                    </div>
                    {step.output && (
                      <pre className="text-[10px] text-white/40 bg-black/30 rounded-lg p-2 mt-2 overflow-x-auto max-h-32">
                        {JSON.stringify(step.output, null, 2)}
                      </pre>
                    )}
                    {step.review_notes && <div className="text-xs text-amber-400 mt-1">{step.review_notes}</div>}
                    {idx < steps.length - 1 && <div className="absolute left-7 -bottom-2 w-px h-4 bg-white/10" />}
                  </div>
                );
              })}
              {runs.find(r => r.id === selected)?.current_step === 'held' && (
                <div className="flex gap-2 pt-2">
                  <ActionButton variant="primary" onClick={() => approve(selected)}><Check size={15} /> Approve & Publish</ActionButton>
                  <ActionButton variant="danger" onClick={() => reject(selected)}><X size={15} /> Reject</ActionButton>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
