-- Loves Aura: AI Team + Features expansion
-- Adds the hierarchical AI agent system, pipeline tracking, and all feature tables

-- ============ SITE SETTINGS EXTENSIONS ============
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS ambient_audio_url text;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS accent_hex text DEFAULT '#3df0ff';
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS ambient_label text DEFAULT 'Ambient Aura';
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS human_in_the_loop boolean DEFAULT true;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS team_active boolean DEFAULT false;

-- ============ AI AGENTS (the team roster) ============
CREATE TABLE IF NOT EXISTS ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  tier smallint NOT NULL DEFAULT 2,
  specialty text NOT NULL,
  system_prompt text NOT NULL,
  model text DEFAULT 'gemini-1.5-flash',
  cadence_cron text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_ai_agents_public" ON ai_agents FOR SELECT TO public USING (true);
CREATE POLICY "select_ai_agents_auth" ON ai_agents FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_ai_agents_auth" ON ai_agents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_ai_agents_auth" ON ai_agents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_ai_agents_auth" ON ai_agents FOR DELETE TO authenticated USING (true);

INSERT INTO ai_agents (slug, name, role, tier, specialty, system_prompt, model, cadence_cron, active) VALUES
('aura-director', 'Director', 'Editor-in-Chief', 1, 'strategy',
 'You are the Director of the Love''s Aura creative atelier. You decide what topics each specialist should work on. You look at the content calendar, past performance, and current themes. You return a JSON list of briefs: [{"agent_slug":"aura-scribe","topic":"...","tone":"..."},{"agent_slug":"aura-voice","topic":"...","tone":"..."}]. Never mention AI. Never add a byline. Think like a visionary editor.',
 'gemini-1.5-flash', '0 9 * * 1', true),
('aura-scribe', 'Scribe', 'Blog Writer', 2, 'blog',
 'You are a literary ghostwriter for Love Parekh, author of the Love''s Aura platform. Write evocative, premium-feeling blog posts. Poetic, reflective, inspiring, modern. Return STRICT JSON: {"title":"","excerpt":"","body":"","tags":[]}. Never mention AI. Never add byline. 600-1200 words.',
 'gemini-1.5-flash', '0 10 * * 1,4', true),
('aura-voice', 'Voice', 'Quote Crafter', 2, 'quotes',
 'You are the poetic voice of Love Parekh. Generate original, evocative quotes. Return STRICT JSON: {"text":"","source":""}. Never mention AI. Never include byline.',
 'gemini-1.5-flash', '0 8 * * *', true),
('aura-curator', 'Curator', 'Media Describer', 2, 'media',
 'You are the descriptive voice for Love''s Aura. Write compelling descriptions for media items. Return STRICT JSON: {"title":"","description":""}. Never mention AI. Never add byline.',
 'gemini-1.5-flash', '0 11 * * 2,5', true),
('aura-bard', 'Bard', 'Journal Writer', 2, 'journal',
 'You are the journal voice of Love Parekh. Write short, introspective journal entries (200-400 words). Return STRICT JSON: {"title":"","body":""}. Never mention AI. Never add byline.',
 'gemini-1.5-flash', '0 7 * * 3,6', true),
('aura-researcher', 'Researcher', 'Topic Scout', 2, 'research',
 'You are a topic researcher for Love''s Aura. Suggest 5 fresh, culturally relevant topics that would resonate with a creative arts audience. Return STRICT JSON: {"topics":["","","","",""]}. Never mention AI.',
 'gemini-1.5-flash', '0 6 * * 1', true),
('aura-titlesmith', 'Titlesmith', 'Headline Polisher', 3, 'titles',
 'You rewrite headlines for maximum emotional pull while keeping elegance. Return STRICT JSON: {"title":""}. Never mention AI. Never add byline.',
 'gemini-1.5-flash', null, true),
('aura-editor', 'Editor', 'Quality Reviewer', 3, 'edit',
 'You are a senior editor for Love''s Aura. Review the draft. Trim fluff, enforce house voice (poetic, reflective, premium). Return STRICT JSON: {"approved":truefalse,"revised_body":"","notes":""}. Never mention AI.',
 'gemini-1.5-flash', null, true),
('aura-warden', 'Warden', 'Brand & Safety Gate', 3, 'safety',
 'You are the brand warden for Love''s Aura. Check the draft for: AI mentions, off-brand tone, plagiarism signals, inappropriate content. Return STRICT JSON: {"passes":truefalse,"reason":"","cleaned_body":""}. Block anything that mentions AI or includes a byline.',
 'gemini-1.5-flash', null, true),
('aura-publisher', 'Publisher', 'Publish Authority', 3, 'publish',
 'You are the publisher for Love''s Aura. You take approved drafts and prepare them for publication under the attribution "Published by Love Parekh". Return STRICT JSON: {"ready":truefalse,"final_title":"","final_body":"","notes":""}.',
 'gemini-1.5-flash', null, true)
ON CONFLICT (slug) DO NOTHING;

-- ============ AI TASKS (the queue) ============
CREATE TABLE IF NOT EXISTS ai_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_slug text NOT NULL REFERENCES ai_agents(slug),
  kind text NOT NULL CHECK (kind IN ('draft','review','gate','polish','publish','direct','research')),
  topic text,
  tone text,
  target_table text,
  target_id uuid,
  input jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending','assigned','running','complete','failed','rejected')),
  priority smallint DEFAULT 5,
  scheduled_for timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_agent ON ai_tasks(agent_slug);
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_ai_tasks_auth" ON ai_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_ai_tasks_auth" ON ai_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_ai_tasks_auth" ON ai_tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_ai_tasks_auth" ON ai_tasks FOR DELETE TO authenticated USING (true);

-- ============ AI PIPELINE RUNS (assembly line tracking) ============
CREATE TABLE IF NOT EXISTS ai_pipeline_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('blog','quote','media_desc','journal')),
  current_step text DEFAULT 'initiated' CHECK (current_step IN ('initiated','director','drafting','editing','warden','titlesmith','publishing','published','rejected','failed','held')),
  target_table text,
  target_id uuid,
  initiated_by text DEFAULT 'director',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_pipeline_status ON ai_pipeline_runs(current_step);
ALTER TABLE ai_pipeline_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_pipeline_auth" ON ai_pipeline_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_pipeline_auth" ON ai_pipeline_runs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_pipeline_auth" ON ai_pipeline_runs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_pipeline_auth" ON ai_pipeline_runs FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS ai_pipeline_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES ai_pipeline_runs(id) ON DELETE CASCADE,
  agent_slug text NOT NULL,
  step_name text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending','running','complete','failed','skipped','rejected')),
  input jsonb,
  output jsonb,
  review_notes text,
  started_at timestamptz,
  completed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_steps_run ON ai_pipeline_steps(run_id);
ALTER TABLE ai_pipeline_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_steps_auth" ON ai_pipeline_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_steps_auth" ON ai_pipeline_steps FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_steps_auth" ON ai_pipeline_steps FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_steps_auth" ON ai_pipeline_steps FOR DELETE TO authenticated USING (true);

-- ============ CONTENT CALENDAR ============
CREATE TABLE IF NOT EXISTS content_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content_type text NOT NULL,
  topic text,
  tone text,
  scheduled_date date NOT NULL,
  status text DEFAULT 'planned' CHECK (status IN ('planned','assigned','drafted','reviewed','published','cancelled')),
  assigned_agent text,
  target_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_date ON content_calendar(scheduled_date);
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_calendar_auth" ON content_calendar FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_calendar_auth" ON content_calendar FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_calendar_auth" ON content_calendar FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_calendar_auth" ON content_calendar FOR DELETE TO authenticated USING (true);

-- ============ SERIALIZED CHAPTERS (The Loom) ============
CREATE TABLE IF NOT EXISTS serialized_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  chapter_number integer NOT NULL,
  excerpt text,
  body text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft','published')),
  author text DEFAULT 'Published by Love Parekh' CHECK (author = 'Published by Love Parekh'),
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chapters_status ON serialized_chapters(status);
CREATE INDEX IF NOT EXISTS idx_chapters_number ON serialized_chapters(chapter_number);
ALTER TABLE serialized_chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_chapters_public" ON serialized_chapters FOR SELECT TO public USING (status = 'published');
CREATE POLICY "select_chapters_auth" ON serialized_chapters FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_chapters_auth" ON serialized_chapters FOR INSERT TO authenticated WITH CHECK (author = 'Published by Love Parekh');
CREATE POLICY "update_chapters_auth" ON serialized_chapters FOR UPDATE TO authenticated USING (true) WITH CHECK (author = 'Published by Love Parekh');
CREATE POLICY "delete_chapters_auth" ON serialized_chapters FOR DELETE TO authenticated USING (true);

-- ============ TIME CAPSULES ============
CREATE TABLE IF NOT EXISTS time_capsules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  capsule_type text DEFAULT 'message' CHECK (capsule_type IN ('message','quote','audio','video','image')),
  unlock_date date NOT NULL,
  status text DEFAULT 'sealed' CHECK (status IN ('sealed','unlocked')),
  author text DEFAULT 'Published by Love Parekh' CHECK (author = 'Published by Love Parekh'),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_capsules_unlock ON time_capsules(unlock_date);
ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_capsules_public" ON time_capsules FOR SELECT TO public USING (
  status = 'unlocked' OR unlock_date <= CURRENT_DATE
);
CREATE POLICY "select_capsules_auth" ON time_capsules FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_capsules_auth" ON time_capsules FOR INSERT TO authenticated WITH CHECK (author = 'Published by Love Parekh');
CREATE POLICY "update_capsules_auth" ON time_capsules FOR UPDATE TO authenticated USING (true) WITH CHECK (author = 'Published by Love Parekh');
CREATE POLICY "delete_capsules_auth" ON time_capsules FOR DELETE TO authenticated USING (true);

-- ============ SCHEDULED DROPS ============
CREATE TABLE IF NOT EXISTS scheduled_drops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  drop_type text NOT NULL CHECK (drop_type IN ('blog','media','quote','chapter','event','special')),
  target_table text,
  target_id uuid,
  drop_date timestamptz NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','completed','cancelled')),
  accent_hex text DEFAULT '#3df0ff',
  author text DEFAULT 'Published by Love Parekh' CHECK (author = 'Published by Love Parekh'),
  created_at timestamptz DEFAULT now(),
  dropped_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_drops_date ON scheduled_drops(drop_date);
ALTER TABLE scheduled_drops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_drops_public" ON scheduled_drops FOR SELECT TO public USING (true);
CREATE POLICY "select_drops_auth" ON scheduled_drops FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_drops_auth" ON scheduled_drops FOR INSERT TO authenticated WITH CHECK (author = 'Published by Love Parekh');
CREATE POLICY "update_drops_auth" ON scheduled_drops FOR UPDATE TO authenticated USING (true) WITH CHECK (author = 'Published by Love Parekh');
CREATE POLICY "delete_drops_auth" ON scheduled_drops FOR DELETE TO authenticated USING (true);

-- ============ READER IDENTITIES (anonymous, no passwords) ============
CREATE TABLE IF NOT EXISTS reader_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id text UNIQUE NOT NULL,
  display_name text DEFAULT 'Wanderer',
  aura_coins integer DEFAULT 0,
  tier text DEFAULT 'seeker' CHECK (tier IN ('seeker','luminary','visionary','oracle')),
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reader_public ON reader_identities(public_id);
ALTER TABLE reader_identities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_readers_public" ON reader_identities FOR SELECT TO public USING (true);
CREATE POLICY "insert_readers_public" ON reader_identities FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "update_readers_public" ON reader_identities FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "select_readers_auth" ON reader_identities FOR SELECT TO authenticated USING (true);

-- ============ AURA COIN TRANSACTIONS ============
CREATE TABLE IF NOT EXISTS aura_coin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reader_id uuid NOT NULL REFERENCES reader_identities(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  reason text NOT NULL,
  reference_type text,
  reference_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coins_reader ON aura_coin_transactions(reader_id);
ALTER TABLE aura_coin_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_coins_public" ON aura_coin_transactions FOR SELECT TO public USING (true);
CREATE POLICY "insert_coins_public" ON aura_coin_transactions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "select_coins_auth" ON aura_coin_transactions FOR SELECT TO authenticated USING (true);

-- ============ NEWSLETTER SUBSCRIBERS ============
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active','unsubscribed')),
  subscribed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_subscribers_auth" ON newsletter_subscribers FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_subscribers_self" ON newsletter_subscribers FOR SELECT TO public USING (true);
CREATE POLICY "insert_subscribers_public" ON newsletter_subscribers FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "update_subscribers_auth" ON newsletter_subscribers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_subscribers_auth" ON newsletter_subscribers FOR DELETE TO authenticated USING (true);

-- ============ AI LETTERS (weekly digest log) ============
CREATE TABLE IF NOT EXISTS ai_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  body text NOT NULL,
  recipient_count integer DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft','queued','sent','failed')),
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_letters_auth" ON ai_letters FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_letters_auth" ON ai_letters FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_letters_auth" ON ai_letters FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_letters_auth" ON ai_letters FOR DELETE TO authenticated USING (true);

-- ============ TEAM ACTIVITY LOG (audit trail) ============
CREATE TABLE IF NOT EXISTS team_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_slug text NOT NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_agent ON team_activity_log(agent_slug);
CREATE INDEX IF NOT EXISTS idx_activity_created ON team_activity_log(created_at DESC);
ALTER TABLE team_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_activity_auth" ON team_activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_activity_auth" ON team_activity_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "delete_activity_auth" ON team_activity_log FOR DELETE TO authenticated USING (true);

-- ============ CONTENT LINKS (for the Constellation graph) ============
CREATE TABLE IF NOT EXISTS content_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL,
  source_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  link_strength real DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (source_type, source_id, target_type, target_id)
);

ALTER TABLE content_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_links_public" ON content_links FOR SELECT TO public USING (true);
CREATE POLICY "select_links_auth" ON content_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_links_auth" ON content_links FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "delete_links_auth" ON content_links FOR DELETE TO authenticated USING (true);

-- Enable pg_cron if available
CREATE EXTENSION IF NOT EXISTS pg_cron;
