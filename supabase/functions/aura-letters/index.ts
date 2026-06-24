import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const REQUIRED_USER = "love@aura";
const REQUIRED_PASS = "loveaura@2019";

type Body = {
  adminUser?: string;
  adminPass?: string;
  action: "compose" | "send" | "subscribe" | "unsubscribe";
  email?: string;
  letterId?: string;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  let body: Body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Public subscribe/unsubscribe
  if (body.action === "subscribe" && body.email) {
    const { error } = await supa.from("newsletter_subscribers").upsert({ email: body.email, status: "active" }, { onConflict: "email" });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  if (body.action === "unsubscribe" && body.email) {
    await supa.from("newsletter_subscribers").update({ status: "unsubscribed" }).eq("email", body.email);
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Admin only
  if (body.adminUser !== REQUIRED_USER || body.adminPass !== REQUIRED_PASS) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    if (body.action === "compose") {
      const geminiKey = Deno.env.get("GEMINI_API_KEY");
      const openaiKey = Deno.env.get("OPENAI_API_KEY");

      const { data: posts } = await supa.from("blog_posts").select("title,excerpt").eq("status", "published").order("published_at", { ascending: false }).limit(3);
      const { data: quotes } = await supa.from("quotes").select("text,source").eq("status", "published").order("created_at", { ascending: false }).limit(2);
      const { data: events } = await supa.from("events").select("title,event_date").eq("status", "published").order("event_date", { ascending: true }).limit(2);

      const context = JSON.stringify({ posts: posts || [], quotes: quotes || [], events: events || [] });
      const sysPrompt = "You are the newsletter composer for Love's Aura. Write a warm, poetic weekly digest email. Return STRICT JSON: {\"subject\":\"\",\"body\":\"\"}. Never mention AI. Sign off as Love Parekh.";

      const model = geminiKey ? "gemini-1.5-flash" : "gpt-4o-mini";
      let raw = "";

      if (geminiKey) {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ systemInstruction: { parts: [{ text: sysPrompt }] }, contents: [{ parts: [{ text: `Compose this week's letter from: ${context}` }] }] }),
        });
        const d = await r.json();
        raw = d.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } else if (openaiKey) {
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
          body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: sysPrompt }, { role: "user", content: `Compose from: ${context}` }], temperature: 0.8 }),
        });
        const d = await r.json();
        raw = d.choices?.[0]?.message?.content || "";
      } else {
        throw new Error("No AI provider configured");
      }

      let s = raw.trim();
      const si = s.indexOf("{"); const ei = s.lastIndexOf("}");
      if (si >= 0 && ei > si) s = s.slice(si, ei + 1);
      const parsed = JSON.parse(s);

      const { data: letter } = await supa.from("ai_letters").insert({ subject: parsed.subject, body: parsed.body, status: "draft" }).select().single();
      return new Response(JSON.stringify({ success: true, letter }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.action === "send" && body.letterId) {
      const { data: letter } = await supa.from("ai_letters").select("*").eq("id", body.letterId).single();
      if (!letter) throw new Error("Letter not found");

      const { data: subs } = await supa.from("newsletter_subscribers").select("email").eq("status", "active");

      // Log — actual email sending requires a provider (Resend/SendGrid)
      await supa.from("ai_letters").update({ status: "queued", recipient_count: subs?.length || 0 }).eq("id", body.letterId);

      // Stub: integrate Resend/SendGrid here when key is set
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey && subs && subs.length > 0) {
        for (const sub of subs) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
            body: JSON.stringify({
              from: "Love's Aura <letters@lovesaura.app>",
              to: [sub.email],
              subject: letter.subject,
              html: letter.body.replace(/\n/g, "<br>"),
            }),
          });
        }
      }

      await supa.from("ai_letters").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", body.letterId);
      return new Response(JSON.stringify({ success: true, sent_to: subs?.length || 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
