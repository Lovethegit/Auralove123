import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Minus, X, Music } from 'lucide-react';

type Props = {
  audioUrl: string | null;
  label: string;
  accentHex: string;
};

export function BackgroundMusicPlayer({ audioUrl, label, accentHex }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [triedPlay, setTriedPlay] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = 'auto';
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audioUrl) {
      audio.src = audioUrl;
      audio.load();
      if (!triedPlay) {
        audio.play()
          .then(() => { setPlaying(true); setTriedPlay(true); })
          .catch(() => { setTriedPlay(true); });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  // Auto-hide after first user interaction block
  useEffect(() => {
    if (triedPlay && !playing && audioUrl && !hidden) {
      const timer = setTimeout(() => setHidden(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [triedPlay, playing, audioUrl, hidden]);

  if (!audioUrl || hidden) {
    if (!audioUrl) return null;
    return (
      <button
        onClick={() => { setHidden(false); audioRef.current?.play().then(() => setPlaying(true)).catch(() => {}); }}
        className="fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
        style={{ background: `radial-gradient(circle, ${accentHex}22, transparent)`, border: `1px solid ${accentHex}55` }}
        aria-label="Show music player"
      >
        <Music size={18} style={{ color: accentHex }} />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 left-6 z-40 transition-all duration-300"
      style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.4))' }}
    >
      <div
        className="rounded-2xl backdrop-blur-xl border transition-all overflow-hidden"
        style={{
          background: 'rgba(7, 5, 18, 0.85)',
          borderColor: `${accentHex}33`,
          width: collapsed ? 56 : 280,
        }}
      >
        {/* Logo orb */}
        <div className="flex items-center gap-3 p-3">
          <button
            onClick={() => togglePlay()}
            className="relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105"
            style={{ background: `conic-gradient(from 0deg, ${accentHex}, #ee9bff, #8b5cff, ${accentHex})` }}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            <div className="absolute inset-[2px] rounded-full bg-[#070512] flex items-center justify-center">
              {playing ? <Minus size={14} style={{ color: accentHex }} /> : <Volume2 size={14} style={{ color: accentHex }} />}
            </div>
            {playing && (
              <div
                className="absolute inset-0 rounded-full animate-spin-slow"
                style={{ background: `conic-gradient(from 0deg, ${accentHex}00, ${accentHex}44, ${accentHex}00)` }}
              />
            )}
          </button>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white/90 truncate" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{label}</div>
              <div className="text-[10px] text-white/50 flex items-center gap-1.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${playing ? 'animate-pulse' : ''}`} style={{ background: accentHex }} />
                {playing ? (muted ? 'Muted' : 'Playing') : 'Paused'}
                {!muted && playing && (
                  <span className="flex items-center gap-0.5 ml-1">
                    <span className="inline-block w-0.5 h-2 rounded-full" style={{ background: accentHex, animation: 'aura-bar 0.6s ease-in-out infinite'}} />
                    <span className="inline-block w-0.5 h-3 rounded-full" style={{ background: accentHex, animation: 'aura-bar 0.8s ease-in-out infinite 0.1s'}} />
                    <span className="inline-block w-0.5 h-1.5 rounded-full" style={{ background: accentHex, animation: 'aura-bar 0.5s ease-in-out infinite 0.2s'}} />
                  </span>
                )}
              </div>
            </div>
          )}

          <div className={`flex items-center gap-1 ${collapsed ? 'hidden' : ''}`}>
            <button
              onClick={() => toggleMute()}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
            <button
              onClick={() => setCollapsed(c => !c)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Collapse"
            >
              <Minus size={13} />
            </button>
            <button
              onClick={() => setHidden(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Hide"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes aura-bar { 0%, 100% { transform: scaleY(0.5); } 50% { transform: scaleY(1); } }
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  }
}
