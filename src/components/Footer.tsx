import { Mail, Heart, Github, Instagram, Youtube, Lock } from 'lucide-react';
import { Logo } from './Logo';
import { navigate } from '../lib/router';

const LEGAL = [
  { label: 'Privacy Policy', path: '/legal/privacy' },
  { label: 'Terms of Service', path: '/legal/terms' },
  { label: 'Cookie Policy', path: '/legal/cookies' },
  { label: 'Disclaimer', path: '/legal/disclaimer' },
] as const;

const EXPLORE = [
  { label: 'Blog', path: '/blog' },
  { label: 'Music Videos', path: '/music-videos' },
  { label: 'Audio Library', path: '/audio-library' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Events', path: '/events' },
  { label: 'Quotes', path: '/quotes' },
] as const;

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <div className="absolute inset-0 bg-aura-radial opacity-50 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-5 md:px-10 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2 space-y-5">
            <Logo />
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              A universe of art, sound, and light. Where every creation carries an aura of its own,
              crafted by {''}
              <span className="text-aura-200">Published by Love Parekh</span>.
            </p>
            <a
              href="mailto:officiallovesaura@gmail.com"
              className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-aura-200 transition group"
            >
              <Mail size={16} className="group-hover:text-neon-pink transition" />
              officiallovesaura@gmail.com
            </a>
            <div className="flex items-center gap-3">
              {[Instagram, Youtube, Github].map((Icon, i) => (
                <span
                  key={i}
                  className="h-10 w-10 grid place-items-center rounded-full border border-white/10 bg-white/[0.02] text-slate-300 hover:text-neon-pink hover:border-aura-400/40 transition"
                >
                  <Icon size={16} />
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.24em] text-aura-200/70 mb-4">Explore</h4>
            <ul className="space-y-2">
              {EXPLORE.map((l) => (
                <li key={l.path}>
                  <button
                    onClick={() => navigate(l.path)}
                    className="text-sm text-slate-400 hover:text-white transition"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.24em] text-aura-200/70 mb-4">Legal</h4>
            <ul className="space-y-2">
              {LEGAL.map((l) => (
                <li key={l.path}>
                  <button
                    onClick={() => navigate(l.path)}
                    className="text-sm text-slate-400 hover:text-white transition"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Love&rsquo;s Aura. All creations attributed to{' '}
            <span className="text-slate-300">Published by Love Parekh</span>.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              Crafted with <Heart size={12} className="text-neon-pink" fill="currentColor" /> and a little aura.
            </p>
            <button
              onClick={() => navigate('/admin')}
              className="text-slate-600 hover:text-aura-200 transition-colors"
              aria-label="Admin access"
              title="Admin"
            >
              <Lock size={12} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
