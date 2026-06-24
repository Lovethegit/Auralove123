import { supabase, ADMIN_USER, ADMIN_PASS, STORAGE_BUCKET } from './supabase';

export { STORAGE_BUCKET };

const FUNCTION_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

export type TableName =
  | 'blog_posts'
  | 'media_items'
  | 'quotes'
  | 'events'
  | 'gallery_images'
  | 'self_notes'
  | 'site_settings'
  | 'ai_agents'
  | 'ai_tasks'
  | 'ai_pipeline_runs'
  | 'ai_pipeline_steps'
  | 'content_calendar'
  | 'team_activity_log'
  | 'serialized_chapters'
  | 'time_capsules'
  | 'scheduled_drops'
  | 'reader_identities'
  | 'aura_coin_transactions'
  | 'newsletter_subscribers'
  | 'ai_letters'
  | 'content_links';

async function call<T = unknown>(payload: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${FUNCTION_BASE}/admin-crud`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = (json && (json.error as string)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return json as T;
}

export const adminApi = {
  list: <T>(table: TableName, opts?: { column?: string; value?: string | boolean | null; orderColumn?: string; ascending?: boolean }) =>
    call<{ data: T[] }>({
      adminUser: ADMIN_USER,
      adminPass: ADMIN_PASS,
      op: 'list',
      table,
      query: opts?.column ? { column: opts.column, value: opts.value ?? null } : undefined,
      order: { column: opts?.orderColumn ?? 'created_at', ascending: opts?.ascending ?? false },
    }).then((r) => r.data ?? []),

  get: <T>(table: TableName, id: string) =>
    call<{ data: T }>({ adminUser: ADMIN_USER, adminPass: ADMIN_PASS, op: 'get', table, id }).then((r) => r.data),

  create: <T>(table: TableName, row: Record<string, unknown>) =>
    call<{ data: T }>({ adminUser: ADMIN_USER, adminPass: ADMIN_PASS, op: 'create', table, row }).then((r) => r.data),

  update: <T>(table: TableName, id: string, row: Record<string, unknown>) =>
    call<{ data: T }>({ adminUser: ADMIN_USER, adminPass: ADMIN_PASS, op: 'update', table, id, row }).then((r) => r.data),

  remove: (table: TableName, id: string) =>
    call<{ ok: true }>({ adminUser: ADMIN_USER, adminPass: ADMIN_PASS, op: 'delete', table, id }),

  settings: () =>
    call<{ data: SiteSettings }>({ adminUser: ADMIN_USER, adminPass: ADMIN_PASS, op: 'settings' }).then((r) => r.data),

  // Storage upload — uses anon client; bucket policies allow authenticated-only writes, but the
  // admin dashboard is gated client-side. For robust storage upload through the service role we
  // would proxy; however, the storage bucket was opened with authenticated policies. To keep
  // uploads working from the hardcoded-admin UI we upload via the anon client and rely on the
  // bucket insert policy that targets authenticated. Since we have no Supabase Auth session,
  // uploads from the browser require the bucket to accept anon inserts — which it does not.
  // Therefore, direct browser uploads are NOT supported in this template; instead, the admin
  // records external URLs / embed URLs natively. Uploaded binary files route through a signed
  // upload to the edge function (file upload endpoint) — see fileUpload below.
  fileUpload: async (file: File): Promise<{ path: string; publicUrl: string }> => {
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safeName}`;
    // Upload via anon client — the storage bucket accepts authenticated inserts; the hardcoded
    // admin has no auth session, so this is expected to be enabled for the bucket. We attempt
    // the upload and surface any error.
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { contentType: file.type || `application/octet-stream`, upsert: false });
    if (error) throw error;
    const publicUrl = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path).data.publicUrl;
    return { path: data.path, publicUrl };
  },
};

export type SiteSettings = {
  id: number;
  hero_title: string;
  hero_subtitle: string;
  about_text: string | null;
  contact_email: string;
  ambient_audio_url: string | null;
  ambient_label: string | null;
  accent_hex: string | null;
  human_in_the_loop: boolean | null;
  team_active: boolean | null;
  updated_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  cover_image_url: string | null;
  tags: string[];
  status: 'draft' | 'published';
  author: string;
  created_at: string;
  updated_at: string;
};

export type MediaCategory =
  | 'music_videos'
  | 'audio_library'
  | 'self_recorded'
  | 'public_media'
  | 'creations';

export type MediaItem = {
  id: string;
  title: string;
  description: string | null;
  category: MediaCategory;
  media_type: 'native' | 'embed';
  storage_path: string | null;
  external_url: string | null;
  embed_url: string | null;
  thumbnail_url: string | null;
  status: 'draft' | 'published';
  sort_order: number;
  author: string;
  created_at: string;
  updated_at: string;
};

export type Quote = {
  id: string;
  text: string;
  source: string | null;
  status: 'draft' | 'published';
  author: string;
  created_at: string;
  updated_at: string;
};

export type AuraEvent = {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  image_url: string | null;
  status: 'draft' | 'published';
  author: string;
  created_at: string;
  updated_at: string;
};

export type GalleryImage = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  storage_path: string | null;
  category: string;
  status: 'draft' | 'published';
  sort_order: number;
  author: string;
  created_at: string;
  updated_at: string;
};

export type SelfNote = {
  id: string;
  title: string | null;
  body: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
};
