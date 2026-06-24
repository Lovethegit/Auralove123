import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { navigate } from '../lib/router';

const NAV_ITEMS = [
  { label: 'Blog', path: '/blog' },
  { label: 'Music Videos', path: '/music-videos' },
  { label: 'Audio Library', path: '/audio-library' },
  { label: 'Self-Recorded', path: '/self-recorded' },
  { label: 'Public Media', path: '/public-media' },
  { label: 'Creations', path: '/creations' },
  { label: 'Events', path: '/events' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Quotes', path: '/quotes' },
  { label: 'Contact', path: '/contact' },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'backdrop-blur-xl bg-ink-950/80 border-b border-white/[0.06]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex h-20 items-center justify-between">
          <Logo onClick={() => go('/')} />

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className="px-3 py-2 rounded-full text-sm text-slate-300 hover:text-white
                           hover:bg-white/[0.05] transition-all duration-300 relative group"
              >
                {item.label}
                <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-aura-400 to-neon-blue scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </button>
            ))}
          </nav>

          <button
            className="lg:hidden p-2 rounded-full text-slate-200 hover:bg-white/[0.06] transition"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-500 ${
          open ? 'max-h-[640px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-6 pt-2 backdrop-blur-xl bg-ink-950/95 border-b border-white/[0.06]">
          <div className="grid grid-cols-2 gap-1.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className="px-4 py-3 rounded-xl text-left text-sm text-slate-200 hover:bg-aura-500/10 hover:text-white transition"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
