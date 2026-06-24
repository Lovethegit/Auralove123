import { useEffect, useState } from 'react';
import { adminTeamData, adminLetters, type NewsletterSubscriber, type AILetter } from '../../lib/agents';
import { AdminHeader, ActionButton, Spinner, toast } from './ui';
import { Mail, Send, Sparkles, Users } from 'lucide-react';

export function NewsletterManager() {
  const [subs, setSubs] = useState<NewsletterSubscriber[]>([]);
  const [letters, setLetters] = useState<AILetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const [s, l] = await Promise.all([adminTeamData.subscribers(), adminTeamData.letters()]);
      setSubs(s);
      setLetters(l);
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const compose = async () => {
    setComposing(true);
    try {
      const result = await adminLetters.compose();
      if (result.success) {
        toast('Letter composed.');
        load();
      } else {
        toast(result.error || 'Failed', 'error');
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'error');
    } finally {
      setComposing(false);
    }
  };

  const send = async (id: string) => {
    setSendingId(id);
    try {
      const result = await adminLetters.send(id);
      if (result.success) {
        toast(`Sent to ${result.sent_to} subscribers.`);
      } else {
        toast(result.error || 'Failed', 'error');
      }
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'error');
    } finally {
      setSendingId(null);
    }
  };

  if (loading) return <Spinner label="Loading newsletter…" />;

  const activeCount = subs.filter((s) => s.status === 'active').length;

  return (
    <div>
      <AdminHeader
        title="Aura Letters"
        subtitle="Newsletter subscribers and weekly digest history."
        action={
          <ActionButton onClick={compose} loading={composing}>
            <Sparkles size={15} /> Compose Letter
          </ActionButton>
        }
      />

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-aura-cyan" />
            <span className="text-xs uppercase tracking-widest text-slate-500">Subscribers</span>
          </div>
          <div className="text-2xl font-display text-white/90">{activeCount}</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Mail size={16} className="text-aura-violet" />
            <span className="text-xs uppercase tracking-widest text-slate-500">Letters Sent</span>
          </div>
          <div className="text-2xl font-display text-white/90">{letters.filter((l) => l.status === 'sent').length}</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Send size={16} className="text-aura-pink" />
            <span className="text-xs uppercase tracking-widest text-slate-500">Drafts</span>
          </div>
          <div className="text-2xl font-display text-white/90">{letters.filter((l) => l.status === 'draft').length}</div>
        </div>
      </div>

      <h3 className="text-sm uppercase tracking-widest text-aura-200/60 mb-3">Letters</h3>
      {letters.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Mail size={28} className="mx-auto mb-2 opacity-30" />
          <p>No letters yet.</p>
        </div>
      ) : (
        <div className="space-y-2 mb-8">
          {letters.map((l, idx) => {
            const lc = l.status === 'sent' ? '#34d399' : l.status === 'draft' ? '#fbbf24' : '#3df0ff';
            const lb = l.status === 'sent' ? '#34d39922' : l.status === 'draft' ? '#fbbf2422' : '#3df0ff22';
            return (
              <div key={l.id || idx} className="glass-card p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm text-white/80 font-medium">{l.subject}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: lb, color: lc }}>
                      {l.status}
                    </span>
                    {l.status === 'draft' && (
                      <ActionButton onClick={() => send(l.id)} loading={sendingId === l.id}>
                        <Send size={12} /> Send
                      </ActionButton>
                    )}
                  </div>
                </div>
                <p className="text-xs text-white/40 line-clamp-2">{l.body}</p>
                <div className="text-[10px] text-slate-500 mt-1">
                  {l.recipient_count > 0 && `${l.recipient_count} recipients · `}
                  {new Date(l.created_at).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h3 className="text-sm uppercase tracking-widest text-aura-200/60 mb-3">Subscribers</h3>
      {subs.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Users size={28} className="mx-auto mb-2 opacity-30" />
          <p>No subscribers yet.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {subs.map((s, idx) => (
            <div key={s.id || idx} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
              <span className="text-sm text-white/70">{s.email}</span>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className="text-[10px] text-slate-500">{new Date(s.subscribed_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
