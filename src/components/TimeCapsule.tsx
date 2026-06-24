import { useEffect, useState } from 'react';
import { Clock, Lock, Unlock } from 'lucide-react';
import { publicFeatures } from '../lib/agents';
import type { TimeCapsule, ScheduledDrop } from '../lib/agents';

function useCountdown(targetDate: string) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setRemaining({ days, hours, minutes, seconds, expired: false });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return remaining;
}

export function TimeCapsuleVault() {
  const [unlocked, setUnlocked] = useState<TimeCapsule[]>([]);
  const [upcoming, setUpcoming] = useState<TimeCapsule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      publicFeatures.capsules(),
      publicFeatures.upcomingCapsules(),
    ]).then(([u, up]) => {
      if (active) { setUnlocked(u); setUpcoming(up); setLoading(false); }
    }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading || (unlocked.length === 0 && upcoming.length === 0)) return null;

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-display text-white/90 mb-1 flex items-center gap-2">
        <Clock size={20} className="text-aura-pink" style={{ color: '#ff3df1' }} />
        The Archive Vault
      </h2>
      <p className="text-sm text-white/40 mb-6">Time capsules sealed for the future — some unlock by date, others remain mysteries.</p>

      {unlocked.length > 0 && (
        <div className="space-y-3 mb-6">
          {unlocked.map((cap) => (
            <div key={cap.id} className="p-5 rounded-2xl border border-aura-cyan/20 bg-aura-cyan/[0.03]" style={{ borderColor: '#3df0ff22' }}>
              <div className="flex items-center gap-2 mb-2">
                <Unlock size={14} style={{ color: '#3df0ff' }} />
                <span className="text-[10px] uppercase tracking-widest" style={{ color: '#3df0ff' }}>Unlocked</span>
              </div>
              <h3 className="text-lg font-display text-white/90 mb-2">{cap.title}</h3>
              <p className="text-sm text-white/60 whitespace-pre-wrap">{cap.body}</p>
            </div>
          ))}
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-2">
          {upcoming.map((cap) => (
            <CapsuleCountdown key={cap.id} capsule={cap} />
          ))}
        </div>
      )}
    </section>
  );
}

function CapsuleCountdown({ capsule }: { capsule: TimeCapsule }) {
  const time = useCountdown(capsule.unlock_date);

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5">
        <Lock size={16} className="text-white/40" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white/70 truncate">{capsule.title}</div>
        <div className="text-[10px] text-white/30">Unlocks {new Date(capsule.unlock_date).toLocaleDateString()}</div>
      </div>
      <div className="flex items-center gap-3 text-center">
        <CountdownUnit value={time.days} label="days" />
        <CountdownUnit value={time.hours} label="hrs" />
        <CountdownUnit value={time.minutes} label="min" />
        <CountdownUnit value={time.seconds} label="sec" />
      </div>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-display text-white/80 tabular-nums">{String(value).padStart(2, '0')}</div>
      <div className="text-[9px] text-white/30 uppercase">{label}</div>
    </div>
  );
}

// ===== Scheduled Drop Countdown =====

export function ScheduledDropCountdown() {
  const [drop, setDrop] = useState<ScheduledDrop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    publicFeatures.nextDrop().then(d => { if (active) { setDrop(d); setLoading(false); } }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading || !drop) return null;

  const time = useCountdown(drop.drop_date);
  const accent = drop.accent_hex || '#3df0ff';

  return (
    <section className="mb-16">
      <div className="relative overflow-hidden rounded-3xl border p-8 md:p-10" style={{ borderColor: `${accent}33`, background: `radial-gradient(circle at 30% 50%, ${accent}0a, transparent 70%)` }}>
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 70% 30%, ${accent}15, transparent 50%)` }} />
        <div className="relative">
          <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: accent }}>Next Drop</div>
          <h2 className="text-3xl md:text-4xl font-display text-white/95 mb-2">{drop.title}</h2>
          {drop.description && <p className="text-sm text-white/50 mb-6 max-w-md">{drop.description}</p>}

          {!time.expired ? (
            <div className="flex items-center gap-4 md:gap-6">
              <CountdownUnitLarge value={time.days} label="Days" accent={accent} />
              <CountdownUnitLarge value={time.hours} label="Hours" accent={accent} />
              <CountdownUnitLarge value={time.minutes} label="Minutes" accent={accent} />
              <CountdownUnitLarge value={time.seconds} label="Seconds" accent={accent} />
            </div>
          ) : (
            <div className="text-2xl font-display animate-pulse" style={{ color: accent }}>Live now.</div>
          )}
        </div>
      </div>
    </section>
  );
}

function CountdownUnitLarge({ value, label, accent }: { value: number; label: string; accent: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-5xl font-display tabular-nums" style={{ color: accent }}>{String(value).padStart(2, '0')}</div>
      <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}
