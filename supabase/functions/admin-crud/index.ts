import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const REQUIRED_USER = "love@aura";
const REQUIRED_PASS = "loveaura@2019";

type Payload = {
  adminUser?: string;
  adminPass?: string;
  op: "list" | "get" | "create" | "update" | "delete" | "uploadUrl" | "settings";
  table?: string;
  id?: string;
  row?: Record<string, unknown>;
  query?: { column: string; value: string | boolean | null };
  order?: { column: string; ascending?: boolean };
};

const ALLOWED = new Set([
  "blog_posts",
  "media_items",
  "quotes",
  "events",
  "gallery_images",
  "self_notes",
  "site_settings",
  "ai_agents",
  "ai_tasks",
  "ai_pipeline_runs",
  "ai_pipeline_steps",
  "content_calendar",
  "team_activity_log",
  "serialized_chapters",
  "time_capsules",
  "scheduled_drops",
  "reader_identities",
  "aura_coin_transactions",
  "newsletter_subscribers",
  "ai_letters",
  "content_links",
]);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const body = (await req.json()) as Payload;
    const { adminUser, adminPass, op, table, id, row, query, order } = body;

    if (adminUser !== REQUIRED_USER || adminPass !== REQUIRED_PASS) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (op !== "settings" && (!table || !ALLOWED.has(table))) {
      return new Response(JSON.stringify({ error: "Invalid table" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    let q;
    switch (op) {
      case "list": {
        q = supabase.from(table!).select("*");
        if (query) q = q.eq(query.column, query.value as never);
        if (order) q = q.order(order.column, { ascending: order.ascending ?? false });
        const { data, error } = await q;
        if (error) throw new Error(error.message);
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "get": {
        const { data, error } = await supabase.from(table!).select("*").eq("id", id).maybeSingle();
        if (error) throw new Error(error.message);
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "create": {
        const { data, error } = await supabase.from(table!).insert(row ?? {}).select().single();
        if (error) throw new Error(error.message);
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "update": {
        const { data, error } = await supabase.from(table!).update(row ?? {}).eq("id", id).select().single();
        if (error) throw new Error(error.message);
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "delete": {
        const { error } = await supabase.from(table!).delete().eq("id", id);
        if (error) throw new Error(error.message);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "settings": {
        const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
        if (error) throw new Error(error.message);
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      default:
        return new Response(JSON.stringify({ error: "Invalid op" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
