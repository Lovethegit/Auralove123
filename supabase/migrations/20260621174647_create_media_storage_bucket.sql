/*
# Love's Aura — Storage Bucket & Policies

## Purpose
Create a public-readable storage bucket `media` for all uploaded media (videos, audio, images,
documents — all file types accepted per requirements). The admin uploads via the service-role
client (bypasses storage RLS), and the public reads via the anon key.

## Storage Policies
- SELECT: public (anon + authenticated) — so visitors can view uploaded media.
- INSERT / UPDATE / DELETE: authenticated only (admin uses service role, which bypasses RLS;
  the authenticated policies are a secondary safeguard).
*/
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_media_bucket" ON storage.objects;
CREATE POLICY "public_read_media_bucket" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'media');

DROP POLICY IF EXISTS "auth_insert_media_bucket" ON storage.objects;
CREATE POLICY "auth_insert_media_bucket" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "auth_update_media_bucket" ON storage.objects;
CREATE POLICY "auth_update_media_bucket" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "auth_delete_media_bucket" ON storage.objects;
CREATE POLICY "auth_delete_media_bucket" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'media');
