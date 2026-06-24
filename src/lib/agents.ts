import { supabase } from './supabase';

const ORCHESTRATOR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aura-orchestrator`;
const LETTERS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aura-letters`;

const ADMIN_USER = 'love@aura';
const ADMIN_PASS = 'loveaura@2019';

export type AgentRole = 'director' | 'scribe' | 'voice' | 'curator' | 'bard' | 'researcher' | 'titlesmith' | 'editor' | 'warden' | 'publisher';

export type AIAgent = {
  id: string;
  slug: string;
  name: string;
  role: string;
  tier: number;
  specialty: string;
  system_prompt: string;
  model: string;
  cadence_cron: string | null;
  active: boolean;
  updated_at: string;
};

export type PipelineRun = {
  id: string;
  topic: string;
  content_type: string;
  current_step: string;
  target_table: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type PipelineStep = {
  id: string;
  run_id: string;
  agent_slug: string;
  step_name: string;
  status: string;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  review_notes: string | null;
  started_at: string | null;
  completed_at: string;
};

export type ContentCalendarEntry = {
  id: string;
  title: string;
  content_type: string;
  topic: string | null;
  tone: string | null;
  scheduled_date: string;
  status: string;
  assigned_agent: string | null;
  target_id: string | null;
};

export type TeamActivity = {
  id: string;
  agent_slug: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

export type SerializedChapter = {
  id: string;
  title: string;
  chapter_number: number;
  excerpt: string | null;
  body: string;
  status: string;
  published_at: string | null;
  created_at: string;
};

export type TimeCapsule = {
  id: string;
  title: string;
  body: string;
  capsule_type: string;
  unlock_date: string;
  status: string;
  created_at: string;
};

export type ScheduledDrop = {
  id: string;
  title: string;
  description: string | null;
  drop_type: string;
  drop_date: string;
  status: string;
  accent_hex: string;
  dropped_at: string | null;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  status: string;
  subscribed_at: string;
};

export type AILetter = {
  id: string;
  subject: string;
  body: string;
  recipient_count: number;
  status: string;
  sent_at: string | null;
  created_at: string;
};

// ===== ADMIN API (calls edge functions) =====

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  };
}

export const adminOrchestrator = {
  async runPipeline(opts: { topic: string; contentType: 'blog' | 'quote' | 'media_desc' | 'journal'; tone?: string }) {
    const res = await fetch(ORCHESTRATOR_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ adminUser: ADMIN_USER, adminPass: ADMIN_PASS, action: 'run_pipeline', ...opts }),
    });
    return res.json();
  },

  async runDirector() {
    const res = await fetch(ORCHESTRATOR_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ adminUser: ADMIN_USER, adminPass: ADMIN_PASS, action: 'run_director' }),
    });
    return res.json();
  },

  async approve(runId: string) {
    const res = await fetch(ORCHESTRATOR_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ adminUser: ADMIN_USER, adminPass: ADMIN_PASS, action: 'approve', runId }),
    });
    return res.json();
  },

  async reject(runId: string) {
    const res = await fetch(ORCHESTRATOR_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ adminUser: ADMIN_USER, adminPass: ADMIN_PASS, action: 'reject', runId }),
    });
    return res.json();
  },

  async publishHeld(runId: string) {
    const res = await fetch(ORCHESTRATOR_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ adminUser: ADMIN_USER, adminPass: ADMIN_PASS, action: 'publish_held', runId }),
    });
    return res.json();
  },

  async runFullCycle() {
    const res = await fetch(ORCHESTRATOR_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ adminUser: ADMIN_USER, adminPass: ADMIN_PASS, action: 'run_full_cycle' }),
    });
    return res.json();
  },
};

export const adminLetters = {
  async compose() {
    const res = await fetch(LETTERS_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ adminUser: ADMIN_USER, adminPass: ADMIN_PASS, action: 'compose' }),
    });
    return res.json();
  },

  async send(letterId: string) {
    const res = await fetch(LETTERS_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ adminUser: ADMIN_USER, adminPass: ADMIN_PASS, action: 'send', letterId }),
    });
    return res.json();
  },
};

// ===== PUBLIC API (direct Supabase queries) =====

export const publicFeatures = {
  // Aurora Stream: recent published content, any type
  async auroraStream(): Promise<{ type: string; title: string; created_at: string; id: string }[]> {
    const [posts, quotes, media, chapters] = await Promise.all([
      supabase.from('blog_posts').select('id,title,created_at').eq('status', 'published').order('created_at', { ascending: false }).limit(3),
      supabase.from('quotes').select('id,text,created_at').eq('status', 'published').order('created_at', { ascending: false }).limit(2),
      supabase.from('media_items').select('id,title,created_at').eq('status', 'published').order('created_at', { ascending: false }).limit(2),
      supabase.from('serialized_chapters').select('id,title,created_at').eq('status', 'published').order('created_at', { ascending: false }).limit(2),
    ]);

    const items: { type: string; title: string; created_at: string; id: string }[] = [];
    (posts.data || []).forEach((p: any) => items.push({ type: 'blog', title: p.title, created_at: p.created_at, id: p.id }));
    (quotes.data || []).forEach((q: any) => items.push({ type: 'quote', title: q.text, created_at: q.created_at, id: q.id }));
    (media.data || []).forEach((m: any) => items.push({ type: 'media', title: m.title, created_at: m.created_at, id: m.id }));
    (chapters.data || []).forEach((c: any) => items.push({ type: 'chapter', title: c.title, created_at: c.created_at, id: c.id }));
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return items.slice(0, 8);
  },

  // The Loom
  async chapters(): Promise<SerializedChapter[]> {
    const { data, error } = await supabase.from('serialized_chapters').select('*').eq('status', 'published').order('chapter_number', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async chapter(id: string): Promise<SerializedChapter | null> {
    const { data, error } = await supabase.from('serialized_chapters').select('*').eq('id', id).eq('status', 'published').maybeSingle();
    if (error) throw error;
    return data;
  },

  // Time Capsules
  async capsules(): Promise<TimeCapsule[]> {
    const { data, error } = await supabase.from('time_capsules').select('*').or(`status.eq.unlocked,unlock_date.lte.${new Date().toISOString().split('T')[0]}`).order('unlock_date', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async upcomingCapsules(): Promise<TimeCapsule[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase.from('time_capsules').select('*').gt('unlock_date', today).order('unlock_date', { ascending: true }).limit(5);
    if (error) throw error;
    return data || [];
  },

  // Scheduled Drops
  async nextDrop(): Promise<ScheduledDrop | null> {
    const now = new Date().toISOString();
    const { data, error } = await supabase.from('scheduled_drops').select('*').gt('drop_date', now).order('drop_date', { ascending: true }).limit(1).maybeSingle();
    if (error) throw error;
    return data;
  },

  async drops(): Promise<ScheduledDrop[]> {
    const { data, error } = await supabase.from('scheduled_drops').select('*').order('drop_date', { ascending: false }).limit(10);
    if (error) throw error;
    return data || [];
  },

  // Newsletter
  async subscribe(email: string): Promise<void> {
    const res = await fetch(LETTERS_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ action: 'subscribe', email }),
    });
    if (!res.ok) throw new Error('Subscribe failed');
  },

  async unsubscribe(email: string): Promise<void> {
    await fetch(LETTERS_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ action: 'unsubscribe', email }),
    });
  },

  // Aura Coins: anonymous identity
  getOrCreateIdentity(): { public_id: string; coins: number; tier: string } {
    const stored = localStorage.getItem('aura_identity');
    if (stored) {
      try { return JSON.parse(stored); } catch { /* fall through */ }
    }
    const id = `aura_${Math.random().toString(36).slice(2, 14)}`;
    const identity = { public_id: id, coins: 0, tier: 'seeker' };
    localStorage.setItem('aura_identity', JSON.stringify(identity));
    supabase.from('reader_identities').insert({ public_id: id, display_name: 'Wanderer', aura_coins: 0, tier: 'seeker' }).then();
    return identity;
  },

  async awardCoins(publicId: string, amount: number, reason: string, refType?: string, refId?: string): Promise<void> {
    const { data: reader } = await supabase.from('reader_identities').select('id,aura_coins').eq('public_id', publicId).maybeSingle();
    if (!reader) return;
    await supabase.from('reader_identities').update({ aura_coins: (reader.aura_coins || 0) + amount, last_seen: new Date().toISOString() }).eq('id', reader.id);
    await supabase.from('aura_coin_transactions').insert({ reader_id: reader.id, amount, reason, reference_type: refType, reference_id: refId });
    const updated = { public_id: publicId, coins: (reader.aura_coins || 0) + amount, tier: tierForCoins((reader.aura_coins || 0) + amount) };
    localStorage.setItem('aura_identity', JSON.stringify(updated));
  },

  async leaderboard(): Promise<{ display_name: string; aura_coins: number; tier: string }[]> {
    const { data, error } = await supabase.from('reader_identities').select('display_name,aura_coins,tier').order('aura_coins', { ascending: false }).limit(10);
    if (error) throw error;
    return data || [];
  },

  // Constellation: content links
  async constellation(): Promise<{ source_type: string; source_id: string; target_type: string; target_id: string; link_strength: number }[]> {
    const { data, error } = await supabase.from('content_links').select('*').limit(200);
    if (error) throw error;
    return data || [];
  },
};

export function tierForCoins(coins: number): string {
  if (coins >= 500) return 'oracle';
  if (coins >= 200) return 'visionary';
  if (coins >= 50) return 'luminary';
  return 'seeker';
}

// ===== ADMIN DATA ACCESS (direct Supabase with service role via admin-crud) =====

export const adminTeamData = {
  async agents(): Promise<AIAgent[]> {
    const { data, error } = await supabase.from('ai_agents').select('*').order('tier', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async updateAgent(slug: string, updates: Partial<AIAgent>): Promise<void> {
    const { error } = await supabase.from('ai_agents').update({ ...updates, updated_at: new Date().toISOString() }).eq('slug', slug);
    if (error) throw error;
  },

  async pipelineRuns(): Promise<PipelineRun[]> {
    const { data, error } = await supabase.from('ai_pipeline_runs').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    return data || [];
  },

  async pipelineSteps(runId: string): Promise<PipelineStep[]> {
    const { data, error } = await supabase.from('ai_pipeline_steps').select('*').eq('run_id', runId).order('completed_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async calendarEntries(): Promise<ContentCalendarEntry[]> {
    const { data, error } = await supabase.from('content_calendar').select('*').order('scheduled_date', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addCalendarEntry(entry: Omit<ContentCalendarEntry, 'id'>): Promise<void> {
    const { error } = await supabase.from('content_calendar').insert(entry);
    if (error) throw error;
  },

  async activityLog(): Promise<TeamActivity[]> {
    const { data, error } = await supabase.from('team_activity_log').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return data || [];
  },

  async subscribers(): Promise<NewsletterSubscriber[]> {
    const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async letters(): Promise<AILetter[]> {
    const { data, error } = await supabase.from('ai_letters').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async chapters(): Promise<SerializedChapter[]> {
    const { data, error } = await supabase.from('serialized_chapters').select('*').order('chapter_number', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async upsertChapter(ch: Partial<SerializedChapter> & { author?: string }): Promise<void> {
    const payload = { ...ch, author: 'Published by Love Parekh' };
    if (ch.id) {
      const { error } = await supabase.from('serialized_chapters').update(payload).eq('id', ch.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('serialized_chapters').insert(payload);
      if (error) throw error;
    }
  },

  async deleteChapter(id: string): Promise<void> {
    const { error } = await supabase.from('serialized_chapters').delete().eq('id', id);
    if (error) throw error;
  },

  async capsules(): Promise<TimeCapsule[]> {
    const { data, error } = await supabase.from('time_capsules').select('*').order('unlock_date', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async upsertCapsule(c: Partial<TimeCapsule> & { author?: string }): Promise<void> {
    const payload = { ...c, author: 'Published by Love Parekh' };
    if (c.id) {
      const { error } = await supabase.from('time_capsules').update(payload).eq('id', c.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('time_capsules').insert(payload);
      if (error) throw error;
    }
  },

  async deleteCapsule(id: string): Promise<void> {
    const { error } = await supabase.from('time_capsules').delete().eq('id', id);
    if (error) throw error;
  },

  async drops(): Promise<ScheduledDrop[]> {
    const { data, error } = await supabase.from('scheduled_drops').select('*').order('drop_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async upsertDrop(d: Partial<ScheduledDrop> & { author?: string }): Promise<void> {
    const payload = { ...d, author: 'Published by Love Parekh' };
    if (d.id) {
      const { error } = await supabase.from('scheduled_drops').update(payload).eq('id', d.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('scheduled_drops').insert(payload);
      if (error) throw error;
    }
  },

  async deleteDrop(id: string): Promise<void> {
    const { error } = await supabase.from('scheduled_drops').delete().eq('id', id);
    if (error) throw error;
  },
};
