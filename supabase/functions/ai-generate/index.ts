import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const REQUIRED_USER = "love@aura";
const REQUIRED_PASS = "loveaura@2019";
const ATTRIBUTION = "Published by Love Parekh";

type Payload = {
  adminUser?: string;
  adminPass?: string;
  topic: string;
  kind: "blog" | "quote" | "description";
  tone?: string;
  targetTable?: "blog_posts" | "quotes" | "media_items";
  storagePath?: string;
  action: "generate" | "save";
  draftId?: string;
  saveMode?: "draft" | "publish";
  generated?: { title?: string; excerpt?: string; body?: string; text?: string; description?: string };
};

const SYSTEM_BLOG =
  "You are a literary ghostwriter for Love Parekh, the author of the 'Love''s Aura' platform. " +
  "Write evocative, premium-feeling blog posts about the requested topic. Tone: poetic, reflective, inspiring, modern. " +
  "Return STRICT JSON only: {\"title\": string, \"excerpt\": string (1-2 sentences), \"body\": string (full markdown article, 600-1200 words), \"tags\": string[]}. " +
  "Never mention AI, never attribute authorship, never add any byline. Do not include the word 'AI'.";

const SYSTEM_QUOTE =
  "You are the poetic voice of Love Parekh for the 'Love''s Aura' platform. " +
  "Generate original, evocative quotes about the requested topic. " +
  "Return STRICT JSON only: {\"text\": string, \"source\": string}. " +
  "Never mention AI, never include any byline, never use the word 'AI'.";

const SYSTEM_DESC =
  "You are the descriptive voice for the 'Love''s Aura' creative platform. " +
  "Write a short, evocative media description (2-4 sentences) for the requested topic. " +
  "Return STRICT JSON only: {\"title\": string, \"description\": string}. " +
  "Never mention AI, never include any byline, never use the word 'AI'.";

function extractJson(raw: string): unknown {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1) text = text.slice(first, last + 1);
  return JSON.parse(text);
}

async function callGemini(system: string, user: string): Promise<string> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("AI provider not configured. Add GEMINI_API_KEY or OPENAI_API_KEY secret.");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { temperature: 0.9, responseMimeType: "application/json" },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no content.");
  return text;
}

async function callOpenAI(system: string, user: string): Promise<string> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) throw new Error("AI provider not configured. Add GEMINI_API_KEY or OPENAI_API_KEY secret.");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.9,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI returned no content.");
  return text;
}

async function generate(system: string, user: string): Promise<string> {
  if (Deno.env.get("GEMINI_API_KEY")) return callGemini(system, user);
  if (Deno.env.get("OPENAI_API_KEY")) return callOpenAI(system, user);
  throw new Error("AI provider not configured. Add GEMINI_API_KEY or OPENAI_API_KEY secret.");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const body = (await req.json()) as Payload;
    const { adminUser, adminPass, topic, kind, tone, action } = body;

    if (adminUser !== REQUIRED_USER || adminPass !== REQUIRED_PASS) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- GENERATE ----
    if (action === "generate") {
      if (!topic || !kind) {
        return new Response(JSON.stringify({ error: "topic and kind are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      let system = SYSTEM_BLOG;
      let user = `Topic: ${topic}.`;
      if (tone) user += ` Desired tone: ${tone}.`;
      if (kind === "blog") {
        system = SYSTEM_BLOG;
        user += " Write the full article with a compelling title, a concise excerpt, and relevant tags.";
      } else if (kind === "quote") {
        system = SYSTEM_QUOTE;
        user += " Generate one original quote.";
      } else {
        system = SYSTEM_DESC;
        user += " Provide a title and a short evocative description.";
      }

      const raw = await generate(system, user);
      const parsed = extractJson(raw) as Record<string, unknown>;
      return new Response(JSON.stringify({ ok: true, content: parsed, attribution: ATTRIBUTION }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- SAVE (draft or publish) ----
    if (action === "save") {
      const targetTable = body.targetTable;
      const saveMode = body.saveMode ?? "draft";
      const status = saveMode === "publish" ? "published" : "draft";
      const gen = body.generated ?? {};

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      let row: Record<string, unknown>;
      if (targetTable === "blog_posts") {
        row = {
          title: (gen.title as string) || "Untitled",
          excerpt: (gen.excerpt as string) || null,
          body: (gen.body as string) || null,
          tags: Array.isArray(gen.tags) ? gen.tags : [],
          status,
        };
      } else if (targetTable === "quotes") {
        row = { text: (gen.text as string) || "Untitled", source: (gen.source as string) || null, status };
      } else {
        return new Response(JSON.stringify({ error: "Unsupported targetTable" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase.from(targetTable).insert(row).select().single();
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ ok: true, saved: data, status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
