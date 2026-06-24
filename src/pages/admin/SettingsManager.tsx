import { useEffect, useState } from 'react';
import { adminApi, type SiteSettings } from '../../lib/adminApi';
import { AdminHeader, ActionButton, Spinner, toast, Field } from './ui';
import { Save, Upload, Brain, Power } from 'lucide-react';

export function SettingsManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState(false);

  useEffect(() => {
    adminApi.settings()
      .then(setSettings)
      .catch((e) => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await adminApi.update<SiteSettings>('site_settings', '1', {
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle,
        about_text: settings.about_text,
        contact_email: settings.contact_email,
        ambient_audio_url: settings.ambient_audio_url,
        ambient_label: settings.ambient_label,
        accent_hex: settings.accent_hex,
        human_in_the_loop: settings.human_in_the_loop,
        team_active: settings.team_active,
      });
      toast('Settings saved.');
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  const uploadMusic = async (file: File) => {
    setUploadingMusic(true);
    try {
      const { publicUrl } = await adminApi.fileUpload(file);
      setSettings(s => s ? { ...s, ambient_audio_url: publicUrl } : s);
      toast('Ambient track uploaded.');
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'error');
    } finally {
      setUploadingMusic(false);
    }
  };

  if (loading || !settings) return <Spinner label="Loading settings…" />;

  const accentColors = ['#3df0ff', '#ee9bff', '#8b5cff', '#ff3df1', '#fbbf24', '#34d399', '#60a5fa', '#f87171'];

  return (
    <div>
      <AdminHeader
        title="Site Settings"
        subtitle="Control hero text, ambient music, accent color, and AI team behavior."
        action={<ActionButton loading={saving} onClick={save}><Save size={15} /> Save</ActionButton>}
      />
      <div className="max-w-2xl space-y-5">
        {/* Homepage */}
        <Field label="Hero title" hint="Shown on the homepage banner.">
          <input value={settings.hero_title} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} className="aura-input" />
        </Field>
        <Field label="Hero subtitle">
          <input value={settings.hero_subtitle} onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })} className="aura-input" />
        </Field>
        <Field label="About text" hint="Optional — used across the site.">
          <textarea value={settings.about_text || ''} onChange={(e) => setSettings({ ...settings, about_text: e.target.value })} rows={4} className="aura-input resize-none" />
        </Field>
        <Field label="Contact email">
          <input value={settings.contact_email} onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })} className="aura-input" />
        </Field>

        {/* Ambient Music */}
        <div className="glass-card p-5 space-y-3">
          <p className="text-xs uppercase tracking-widest text-aura-200/70">Ambient Background Music</p>
          <Field label="Track label" hint="Shown in the floating music player.">
            <input value={settings.ambient_label || ''} onChange={(e) => setSettings({ ...settings, ambient_label: e.target.value })} className="aura-input" placeholder="Ambient Aura" />
          </Field>
          <Field label="Audio URL" hint="Direct URL to an MP3/WAV file, or upload below.">
            <input value={settings.ambient_audio_url || ''} onChange={(e) => setSettings({ ...settings, ambient_audio_url: e.target.value })} className="aura-input" placeholder="https://…/ambient.mp3" />
          </Field>
          <div className="flex items-center gap-3">
            <label className="aura-btn-secondary cursor-pointer flex items-center gap-2">
              <Upload size={14} />
              {uploadingMusic ? 'Uploading…' : 'Upload audio file'}
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                disabled={uploadingMusic}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMusic(f); }}
              />
            </label>
            {settings.ambient_audio_url && (
              <span className="text-xs text-emerald-400">Track set</span>
            )}
          </div>
        </div>

        {/* Accent Color */}
        <div className="glass-card p-5 space-y-3">
          <p className="text-xs uppercase tracking-widest text-aura-200/70">Accent Color</p>
          <p className="text-xs text-slate-500">Used in the music player orb, drop countdowns, and highlights.</p>
          <div className="flex items-center gap-2 flex-wrap">
            {accentColors.map(color => (
              <button
                key={color}
                onClick={() => setSettings({ ...settings, accent_hex: color })}
                className={`w-8 h-8 rounded-full transition-all ${settings.accent_hex === color ? 'ring-2 ring-white ring-offset-2 ring-offset-ink-900 scale-110' : 'hover:scale-110'}`}
                style={{ background: color }}
              />
            ))}
            <input
              type="color"
              value={settings.accent_hex || '#3df0ff'}
              onChange={(e) => setSettings({ ...settings, accent_hex: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/20"
            />
          </div>
        </div>

        {/* AI Team Controls */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Brain size={16} className="text-aura-violet" />
            <p className="text-xs uppercase tracking-widest text-aura-200/70">AI Team Controls</p>
          </div>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm text-white/80 flex items-center gap-2"><Power size={13} /> Team active</div>
              <div className="text-xs text-slate-500">When on, the team can generate and publish content autonomously.</div>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, team_active: !settings.team_active })}
              className={`relative w-11 h-6 rounded-full transition-colors ${settings.team_active ? 'bg-emerald-500' : 'bg-white/10'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings.team_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm text-white/80">Human-in-the-loop</div>
              <div className="text-xs text-slate-500">When on, AI drafts require your approval before publishing.</div>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, human_in_the_loop: !settings.human_in_the_loop })}
              className={`relative w-11 h-6 rounded-full transition-colors ${settings.human_in_the_loop ? 'bg-aura-cyan' : 'bg-white/10'}`}
              style={{ background: settings.human_in_the_loop ? '#3df0ff' : undefined }}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings.human_in_the_loop ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>
        </div>

        {/* Attribution */}
        <div className="glass-card p-5">
          <p className="text-xs uppercase tracking-widest text-aura-200/70 mb-2">Attribution</p>
          <p className="font-display text-lg text-white">Published by Love Parekh</p>
          <p className="mt-1 text-xs text-slate-500">All content is permanently attributed to Love Parekh in the database — this cannot be changed.</p>
        </div>
      </div>
    </div>
  );
}
