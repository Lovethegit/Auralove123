import { useEffect, useState, useRef } from 'react';
import { Star, Mail } from 'lucide-react';
import { publicFeatures } from '../lib/agents';

export function NewsletterWidget() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await publicFeatures.subscribe(email);
      setStatus('done');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="mb-16">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 p-8 md:p-10 bg-gradient-to-br from-aura-purple/[0.05] to-transparent">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ee9bff, transparent 70%)' }} />
        <div className="relative max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <Mail size={18} className="text-aura-violet" style={{ color: '#8b5cff' }} />
            <h2 className="text-xl font-display text-white/90">Aura Letters</h2>
          </div>
          <p className="text-sm text-white/50 mb-4">A weekly dispatch — the freshest writing, a new quote, and what's coming. Delivered with care.</p>
          {status === 'done' ? (
            <div className="text-sm text-aura-cyan" style={{ color: '#3df0ff' }}>You're on the list. Watch your inbox.</div>
          ) : (
            <form onSubmit={submit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 aura-input"
                disabled={status === 'loading'}
              />
              <button type="submit" className="aura-btn-primary" disabled={status === 'loading'}>
                {status === 'loading' ? '…' : 'Subscribe'}
              </button>
            </form>
          )}
          {status === 'error' && <div className="text-xs text-red-400 mt-2">Something went wrong. Try again.</div>}
        </div>
      </div>
    </section>
  );
}

// ===== Constellation Graph =====

type LinkRow = { source_type: string; source_id: string; target_type: string; target_id: string; link_strength: number };

export function ConstellationGraph() {
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<SVGSVGElement | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    publicFeatures.constellation().then(data => { if (active) { setLinks(data); setLoading(false); } }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading || links.length === 0) return null;

  // Build nodes from links
  const nodeMap = new Map<string, { id: string; type: string; x: number; y: number }>();
  const center = 200;
  const radius = 140;
  const allNodes = new Set<string>();
  links.forEach(l => { allNodes.add(`${l.source_type}:${l.source_id}`); allNodes.add(`${l.target_type}:${l.target_id}`); });
  const nodesArr = Array.from(allNodes);
  nodesArr.forEach((id, i) => {
    const angle = (i / nodesArr.length) * Math.PI * 2;
    nodeMap.set(id, { id, type: id.split(':')[0], x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius });
  });

  const COLORS: Record<string, string> = { blog_posts: '#3df0ff', quotes: '#ff3df1', media_items: '#ee9bff', events: '#8b5cff', gallery_images: '#fbbf24' };

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-display text-white/90 mb-1 flex items-center gap-2">
        <Star size={20} style={{ color: '#ee9bff' }} />
        The Constellation
      </h2>
      <p className="text-sm text-white/40 mb-6">Every piece of content connected thematically. Explore the web.</p>
      <div className="relative flex justify-center">
        <svg ref={canvasRef} viewBox="0 0 400 400" className="w-full max-w-md h-auto">
          {/* Links */}
          {links.map((l, i) => {
            const src = nodeMap.get(`${l.source_type}:${l.source_id}`);
            const tgt = nodeMap.get(`${l.target_type}:${l.target_id}`);
            if (!src || !tgt) return null;
            const isHovered = hovered === `${l.source_type}:${l.source_id}` || hovered === `${l.target_type}:${l.target_id}`;
            return (
              <line
                key={i}
                x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                stroke={isHovered ? '#ee9bff' : '#ffffff15'}
                strokeWidth={isHovered ? 1.5 : 0.5}
                className="transition-all"
              />
            );
          })}
          {/* Nodes */}
          {Array.from(nodeMap.values()).map(node => {
            const color = COLORS[node.type] || '#3df0ff';
            const isHovered = hovered === node.id;
            return (
              <g key={node.id}>
                <circle
                  cx={node.x} cy={node.y} r={isHovered ? 8 : 5}
                  fill={color}
                  opacity={isHovered ? 1 : 0.7}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                />
                {isHovered && (
                  <circle cx={node.x} cy={node.y} r={14} fill="none" stroke={color} strokeWidth={0.5} opacity={0.4} className="animate-pulse" />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
