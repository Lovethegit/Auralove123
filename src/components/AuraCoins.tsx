import { useEffect, useState } from 'react';
import { Coins, Trophy } from 'lucide-react';
import { publicFeatures } from '../lib/agents';

type Reader = { display_name: string; aura_coins: number; tier: string };

const TIER_COLORS: Record<string, string> = {
  seeker: '#3df0ff',
  luminary: '#ee9bff',
  visionary: '#8b5cff',
  oracle: '#ff3df1',
};

export function AuraCoins() {
  const [identity, setIdentity] = useState({ public_id: '', coins: 0, tier: 'seeker' });
  const [leaders, setLeaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = publicFeatures.getOrCreateIdentity();
    setIdentity(id);
    publicFeatures.leaderboard().then(setLeaders).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const nextTier = identity.tier === 'seeker' ? 'luminary' : identity.tier === 'luminary' ? 'visionary' : 'oracle';
  const nextThreshold = identity.tier === 'seeker' ? 50 : identity.tier === 'luminary' ? 200 : 500;
  const progress = Math.min(100, (identity.coins / nextThreshold) * 100);

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-display text-white/90 mb-1 flex items-center gap-2">
        <Coins size={20} className="text-aura-gold" style={{ color: '#fbbf24' }} />
        Aura Coins
      </h2>
      <p className="text-sm text-white/40 mb-6">Earn light as you explore. No accounts, no passwords — just your aura.</p>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Your identity */}
        <div className="p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/40">Your Tier</div>
              <div className="text-lg font-display capitalize" style={{ color: TIER_COLORS[identity.tier] }}>{identity.tier}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-display text-white/90">{identity.coins}</div>
              <div className="text-[10px] text-white/40">coins</div>
            </div>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: TIER_COLORS[identity.tier] }} />
          </div>
          <div className="text-[10px] text-white/30 mt-1.5">{nextThreshold - identity.coins} coins to {nextTier}</div>
        </div>

        {/* Leaderboard */}
        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} style={{ color: '#fbbf24' }} />
            <span className="text-xs uppercase tracking-widest text-white/40">Most Luminous</span>
          </div>
          {loading ? (
            <div className="text-xs text-white/30">Loading…</div>
          ) : leaders.length === 0 ? (
            <div className="text-xs text-white/30">Be the first to earn light.</div>
          ) : (
            <div className="space-y-1.5">
              {leaders.slice(0, 5).map((l, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-white/30 w-4 text-right text-xs">{i + 1}</span>
                  <span className="flex-1 text-white/70 truncate">{l.display_name}</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: TIER_COLORS[l.tier] || '#3df0ff' }} />
                  <span className="text-white/50 text-xs tabular-nums">{l.aura_coins}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
