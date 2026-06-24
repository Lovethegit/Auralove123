import { useState } from 'react';
import { ADMIN_USER, ADMIN_PASS, ATTRIBUTION } from '../../lib/supabase';
import { AdminHeader, ActionButton, toast, Field } from './ui';
import { Brain, Sparkles, Send, FileText, Quote as QuoteIcon, Wand2, Save, BadgeCheck } from 'lucide-react';

type Kind = 'blog' | 'quote' | 'description';
type SaveTarget = 'blog_posts' | 'quotes';

type GenContent = {
  title?: string;
  excerpt?: string;
  body?: string;
  text?: string;
  source?: string;
  description?: string;
  tags?: string[];
};

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate`;
const HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

export function AIStudio() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('');
  const [kind, setKind] = useState<Kind>('blog');
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<GenContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!topic.trim()) return toast('Enter a topic first.', 'error');
    setBusy(true);
    setError(null);
    setContent(null);
    try {
      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          adminUser: ADMIN_USER,
          adminPass: ADMIN_PASS,
          topic: topic.trim(),
          kind,
          tone: tone.trim() || undefined,
          action: 'generate',
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
      setContent(json.content as GenContent);
      toast('Content generated.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      toast(msg, 'error');
    } finally {
      setBusy(false);
    }
  };

  const save = async (mode: 'draft' | 'publish') => {
    if (!content) return;
    const targetTable: SaveTarget | null = kind === 'blog' ? 'blog_posts' : kind === 'quote' ? 'quotes' : null;
    if (!targetTable) return toast('Descriptions are generated for reference — copy them into a media item.', 'error');
    setSaving(true);
    try {
      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          adminUser: ADMIN_USER,
          adminPass: ADMIN_PASS,
          action: 'save',
          targetTable,
          saveMode: mode,
          generated: content,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `Save failed (${res.status})`);
      toast(mode === 'publish' ? 'Published to the live site.' : 'Saved as draft.');
      setContent(null);
      setTopic('');
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminHeader
        title="AI Generation Studio"
        subtitle="The Brain — generate full blog posts, quotes, and media descriptions. Every output is permanently attributed as Published by Love Parekh."
      />

      {/* Attribution rule banner */}
      <div className="glass-card p-4 mb-6 flex items-center gap-3 border-aura-400/20 bg-aura-500/[0.04]">
        <BadgeCheck size={18} className="text-aura-200" />
        <p className="text-sm text-slate-300">
          Content is never labeled as &ldquo;AI generated&rdquo; — all generated material is attributed exclusively as{' '}
          <span className="text-aura-200">{ATTRIBUTION}</span>, enforced at the database level.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-5">
          <Field label="Content type">
            <div className="grid grid-cols-3 gap-2">
              {([
                { k: 'blog', label: 'Blog', icon: FileText },
                { k: 'quote', label: 'Quote', icon: QuoteIcon },
                { k: 'description', label: 'Description', icon: Wand2 },
              ] as const).map((o) => (
                <button
                  key={o.k}
                  onClick={() => setKind(o.k)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-xl border text-xs transition ${kind === o.k ? 'border-aura-400/40 bg-aura-500/10 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}
                >
                  <o.icon size={18} className={kind === o.k ? 'text-neon-pink' : ''} />
                  {o.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Topic" hint="Be specific — what should the content be about?">
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} className="aura-input resize-none" placeholder="e.g. The silence between two heartbeats" autoFocus />
          </Field>

          <Field label="Tone" hint="Optional — e.g. poetic, bold, melancholic.">
            <input value={tone} onChange={(e) => setTone(e.target.value)} className="aura-input" placeholder="poetic and luminous" />
          </Field>

          <div className="w-full">
            <ActionButton onClick={generate} loading={busy}>
              <span className="flex items-center gap-2">
                {busy ? 'Generating…' : (<><Sparkles size={15} /> Generate content</>)}
              </span>
            </ActionButton>
          </div>

          {error && (
            <div className="glass-card p-4 text-sm text-red-300 border-red-500/30">
              <p className="font-medium mb-1">The Brain couldn&rsquo;t respond.</p>
              <p className="text-xs text-slate-400">{error}</p>
              <p className="text-xs text-slate-500 mt-2">
                Ensure an AI provider key is configured (GEMINI_API_KEY or OPENAI_API_KEY Supabase secret).
                Descriptions and quotes can still be written manually in their managers.
              </p>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="lg:col-span-3">
          <div className="glass-panel p-6 min-h-[420px]">
            {busy ? (
              <div className="grid place-items-center py-24">
                <div className="relative">
                  <Brain size={40} className="text-aura-300 animate-pulse" />
                  <div className="absolute inset-0 blur-xl bg-aura-500/40 rounded-full" />
                </div>
                <p className="mt-5 text-sm text-slate-400">The Brain is composing…</p>
              </div>
            ) : content ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="chip"><Sparkles size={11} /> generated</span>
                  <span className="text-xs text-slate-500">Review before publishing</span>
                </div>

                {kind === 'blog' && (
                  <>
                    {content.title && <input value={content.title} onChange={(e) => setContent({ ...content, title: e.target.value })} className="aura-input font-display text-xl" />}
                    {content.excerpt !== undefined && (
                      <Field label="Excerpt">
                        <textarea value={content.excerpt || ''} onChange={(e) => setContent({ ...content, excerpt: e.target.value })} rows={2} className="aura-input resize-none" />
                      </Field>
                    )}
                    {content.body !== undefined && (
                      <Field label="Body (Markdown)">
                        <textarea value={content.body || ''} onChange={(e) => setContent({ ...content, body: e.target.value })} rows={16} className="aura-input resize-y font-mono text-sm" />
                      </Field>
                    )}
                    {Array.isArray(content.tags) && (
                      <Field label="Tags">
                        <input
                          value={content.tags.join(', ')}
                          onChange={(e) => setContent({ ...content, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                          className="aura-input"
                        />
                      </Field>
                    )}
                  </>
                )}

                {kind === 'quote' && (
                  <>
                    <Field label="Quote text">
                      <textarea value={content.text || ''} onChange={(e) => setContent({ ...content, text: e.target.value })} rows={4} className="aura-input resize-none" />
                    </Field>
                    <Field label="Source">
                      <input value={content.source || ''} onChange={(e) => setContent({ ...content, source: e.target.value })} className="aura-input" />
                    </Field>
                  </>
                )}

                {kind === 'description' && (
                  <>
                    <Field label="Title">
                      <input value={content.title || ''} onChange={(e) => setContent({ ...content, title: e.target.value })} className="aura-input" />
                    </Field>
                    <Field label="Description">
                      <textarea value={content.description || ''} onChange={(e) => setContent({ ...content, description: e.target.value })} rows={5} className="aura-input resize-none" />
                    </Field>
                    <p className="text-xs text-slate-500">Descriptions are generated for reference. Copy them into a media item in the relevant media manager.</p>
                  </>
                )}

                <div className="glass-card p-3 flex items-center gap-2">
                  <BadgeCheck size={14} className="text-aura-200" />
                  <p className="text-xs text-slate-300">Will be attributed as <span className="text-aura-200">{ATTRIBUTION}</span></p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <ActionButton variant="ghost" loading={saving} onClick={() => save('draft')}><Save size={15} /> Save as Draft</ActionButton>
                  <ActionButton loading={saving} onClick={() => save('publish')}><Send size={15} /> Publish Immediately</ActionButton>
                </div>
              </div>
            ) : (
              <div className="grid place-items-center py-20 text-center">
                <div className="h-16 w-16 rounded-full border border-white/10 grid place-items-center bg-aura-500/[0.04]">
                  <Brain size={26} className="text-aura-300/60" />
                </div>
                <p className="mt-4 text-sm text-slate-400">Enter a topic and let the Brain compose.</p>
                <p className="text-xs text-slate-600 mt-1">Blog posts &amp; quotes can be saved as drafts or published directly.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
