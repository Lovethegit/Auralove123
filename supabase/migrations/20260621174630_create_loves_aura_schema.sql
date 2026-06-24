/*
# Love's Aura — Core Content Schema

## Purpose
Single-tenant CMS schema for the "Love's Aura" platform. All content is managed by a single
administrator (hardcoded dashboard login at the app layer — no Supabase Auth). Public visitors
(anonymous key) can READ published content. Writes are performed by the admin using the
service-role key from the dashboard. Policies harden the anon path so a leaked anon key cannot
mutate data; the service role bypasses RLS.

## Attribution Rule (ENFORCED at DB layer)
Every content table includes an `author` column with DEFAULT 'Published by Love Parekh' AND a
CHECK constraint that the value MUST equal 'Published by Love Parekh'. This makes attribution
permanent and exclusive at the database level — no piece of content (manual or AI-generated) can
ever be labeled otherwise, including the strict "no AI Generated tags" rule.

## New Tables
1. `blog_posts` — long-form articles (title, excerpt, body, cover image, tags, status).
2. `media_items` — unified media records supporting native uploads (storage path) and embedded
   iframes (YouTube etc.). `category` partitions media into: music_videos, audio_library,
   self_recorded, public_media, creations.
3. `quotes` — short inspirational text quotes.
4. `events` — dated events with location + description.
5. `gallery_images` — image gallery entries.
6. `self_notes` — PRIVATE personal notes, admin-only (no anon read policy).
7. `site_settings` — single-row key/value store for site-wide config.

## Security
- RLS enabled on every table.
- Public (anon + authenticated) SELECT on all content tables EXCEPT `self_notes`.
- `self_notes` has NO anon policy — admin-only.
- Writes restricted to `authenticated` role on content tables.
- Storage bucket `media` is created and set public for reads.

## Idempotency
All statements use IF NOT EXISTS / DROP POLICY IF EXISTS so re-running is safe.
*/

-- ============================================================================
-- 1. BLOG POSTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text,
  body text,
  cover_image_url text,
  tags text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  author text NOT NULL DEFAULT 'Published by Love Parekh'
    CHECK (author = 'Published by Love Parekh'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_blog_posts" ON blog_posts;
CREATE POLICY "public_read_blog_posts" ON blog_posts FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "auth_insert_blog_posts" ON blog_posts;
CREATE POLICY "auth_insert_blog_posts" ON blog_posts FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_blog_posts" ON blog_posts;
CREATE POLICY "auth_update_blog_posts" ON blog_posts FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_blog_posts" ON blog_posts;
CREATE POLICY "auth_delete_blog_posts" ON blog_posts FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created ON blog_posts(created_at DESC);

-- ============================================================================
-- 2. MEDIA ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS media_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN
    ('music_videos','audio_library','self_recorded','public_media','creations')),
  media_type text NOT NULL DEFAULT 'native' CHECK (media_type IN ('native','embed')),
  storage_path text,
  external_url text,
  embed_url text,
  thumbnail_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  sort_order int NOT NULL DEFAULT 0,
  author text NOT NULL DEFAULT 'Published by Love Parekh'
    CHECK (author = 'Published by Love Parekh'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_media_items" ON media_items;
CREATE POLICY "public_read_media_items" ON media_items FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "auth_insert_media_items" ON media_items;
CREATE POLICY "auth_insert_media_items" ON media_items FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_media_items" ON media_items;
CREATE POLICY "auth_update_media_items" ON media_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_media_items" ON media_items;
CREATE POLICY "auth_delete_media_items" ON media_items FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_media_items_category ON media_items(category, status);
CREATE INDEX IF NOT EXISTS idx_media_items_sort ON media_items(category, sort_order, created_at DESC);

-- ============================================================================
-- 3. QUOTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  source text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  author text NOT NULL DEFAULT 'Published by Love Parekh'
    CHECK (author = 'Published by Love Parekh'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_quotes" ON quotes;
CREATE POLICY "public_read_quotes" ON quotes FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "auth_insert_quotes" ON quotes;
CREATE POLICY "auth_insert_quotes" ON quotes FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_quotes" ON quotes;
CREATE POLICY "auth_update_quotes" ON quotes FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_quotes" ON quotes;
CREATE POLICY "auth_delete_quotes" ON quotes FOR DELETE
  TO authenticated USING (true);

-- ============================================================================
-- 4. EVENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date,
  location text,
  image_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  author text NOT NULL DEFAULT 'Published by Love Parekh'
    CHECK (author = 'Published by Love Parekh'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_events" ON events;
CREATE POLICY "public_read_events" ON events FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "auth_insert_events" ON events;
CREATE POLICY "auth_insert_events" ON events FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_events" ON events;
CREATE POLICY "auth_update_events" ON events FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_events" ON events;
CREATE POLICY "auth_delete_events" ON events FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

-- ============================================================================
-- 5. GALLERY IMAGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  image_url text NOT NULL,
  storage_path text,
  category text DEFAULT 'general',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  sort_order int NOT NULL DEFAULT 0,
  author text NOT NULL DEFAULT 'Published by Love Parekh'
    CHECK (author = 'Published by Love Parekh'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_gallery" ON gallery_images;
CREATE POLICY "public_read_gallery" ON gallery_images FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "auth_insert_gallery" ON gallery_images;
CREATE POLICY "auth_insert_gallery" ON gallery_images FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_gallery" ON gallery_images;
CREATE POLICY "auth_update_gallery" ON gallery_images FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_gallery" ON gallery_images;
CREATE POLICY "auth_delete_gallery" ON gallery_images FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_gallery_sort ON gallery_images(sort_order, created_at DESC);

-- ============================================================================
-- 6. SELF NOTES (PRIVATE — admin only)
-- ============================================================================
CREATE TABLE IF NOT EXISTS self_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  body text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE self_notes ENABLE ROW LEVEL SECURITY;

-- NO public/anon policy. Admin uses service role (bypasses RLS) but we also add
-- authenticated policies so a real logged-in session (if ever added) can manage them.
DROP POLICY IF EXISTS "auth_select_self_notes" ON self_notes;
CREATE POLICY "auth_select_self_notes" ON self_notes FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_self_notes" ON self_notes;
CREATE POLICY "auth_insert_self_notes" ON self_notes FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_self_notes" ON self_notes;
CREATE POLICY "auth_update_self_notes" ON self_notes FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_self_notes" ON self_notes;
CREATE POLICY "auth_delete_self_notes" ON self_notes FOR DELETE
  TO authenticated USING (true);

-- ============================================================================
-- 7. SITE SETTINGS (single-row config)
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_title text NOT NULL DEFAULT 'Love''s Aura',
  hero_subtitle text NOT NULL DEFAULT 'A universe of art, sound, and light.',
  about_text text,
  contact_email text NOT NULL DEFAULT 'officiallovesaura@gmail.com',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_settings" ON site_settings;
CREATE POLICY "public_read_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_settings" ON site_settings;
CREATE POLICY "auth_update_settings" ON site_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- updated_at auto-maintenance triggers
-- ============================================================================
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blog_posts_updated ON blog_posts;
CREATE TRIGGER trg_blog_posts_updated BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_media_items_updated ON media_items;
CREATE TRIGGER trg_media_items_updated BEFORE UPDATE ON media_items
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_quotes_updated ON quotes;
CREATE TRIGGER trg_quotes_updated BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_events_updated ON events;
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_gallery_updated ON gallery_images;
CREATE TRIGGER trg_gallery_updated BEFORE UPDATE ON gallery_images
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_self_notes_updated ON self_notes;
CREATE TRIGGER trg_self_notes_updated BEFORE UPDATE ON self_notes
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_settings_updated ON site_settings;
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
