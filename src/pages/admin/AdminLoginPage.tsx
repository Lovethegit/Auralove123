import { useState } from 'react';
import { useAdmin } from '../../lib/adminAuth';
import { navigate } from '../../lib/router';
import { Logo } from '../../components/Logo';
import { Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

export function AdminLoginPage() {
  const { login } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setTimeout(() => {
      const ok = login(username.trim(), password);
      if (ok) {
        navigate('/admin/dashboard');
      } else {
        setError('Invalid credentials. Access denied.');
      }
      setBusy(false);
    }, 350);
  };

  return (
    <div className="min-h-screen relative grid place-items-center px-5 overflow-hidden">
      {/* Aura background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-aura-500/20 blur-[140px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-neon-blue/15 blur-[150px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" showText={false} />
          <h1 className="mt-6 font-display text-4xl aura-gradient-text">Love&rsquo;s Aura</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.32em] text-slate-400">Admin Atelier</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-5">
          <div>
            <label className="aura-label">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="aura-input pl-11"
                placeholder="love@aura"
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="aura-label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="aura-input pl-11 pr-11"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label="Toggle password visibility"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
              {error}
            </div>
          )}

          <button type="submit" disabled={busy} className="aura-btn-primary w-full disabled:opacity-60">
            {busy ? 'Verifying…' : <>Enter <ArrowRight size={15} /></>}
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
            <Lock size={11} />
            Restricted access. Authorized personnel only.
          </div>
        </form>

        <button onClick={() => navigate('/')} className="mt-6 mx-auto block text-xs text-slate-500 hover:text-aura-200 transition">
          ← Back to public site
        </button>
      </div>
    </div>
  );
}
