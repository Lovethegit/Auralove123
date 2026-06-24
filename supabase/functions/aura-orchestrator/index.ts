import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const REQUIRED_USER = "love@aura";
const REQUIRED_PASS = "loveaura@2019";
const ATTRIBUTION = "Published by Love Parekh";

type Agent = {
  slug: string;
  name: string;
  role: string;
  tier: number;
  specialty: string;
  system_prompt: string;
  model: string;
  cadence_cron: string | null;
  active: boolean;
};

type PipelineRun = {
  id: string;
  topic: string;
  content_type: string;
  current_step: string;
  target_table: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
};

type Body = {
  adminUser?: string;
  adminPass?: string;
  action: "run_pipeline" | "run_director" | "run_agent" | "approve" | "reject" | "publish_held" | "run_full_cycle";
  topic?: string;
  contentType?: "blog" | "quote" | "media_desc" | "journal";
  tone?: string;
  agentSlug?: string;
  runId?: string;
  stepId?: string;
};

function authed(b: Body) {
  return b.adminUser === REQUIRED_USER && b.adminPass === REQUIRED_PASS;
}

async function callAI(model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");

  if (geminiKey && model.startsWith("gemini")) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 4096 },
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  if (openaiKey) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: model.startsWith("gpt") ? model : "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 4096,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  throw new Error("No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY");
}

function extractJSON(raw: string): Record<string, unknown> {
  let t = raw.trim();
  const s = t.indexOf("{");
  const e = t.lastIndexOf("}");
  if (s >= 0 && e > s) t = t.slice(s, e + 1);
  return JSON.parse(t);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  if (!authed(body)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    if (body.action === "run_full_cycle") {
      // Step 1: Run the Director to generate briefs
      const { data: director } = await supa.from("ai_agents").select("*").eq("slug", "aura-director").single();
      if (!director) throw new Error("Director agent not found");

      const { data: recentPosts } = await supa.from("blog_posts").select("title,excerpt").order("created_at", { ascending: false }).limit(5);
      const recentTitles = (recentPosts || []).map((r: any) => r.title).join(", ");

      const directorPrompt = `Generate content briefs for this week. Recent posts: ${recentTitles || "none yet"}. Create 3 briefs: one blog post, one quote, one journal entry. Return JSON array.`;
      const directorRaw = await callAI(director.model, director.system_prompt, directorPrompt);
      const directorParsed = JSON.parse(directorRaw);
      const briefs = Array.isArray(directorParsed) ? directorParsed : (directorParsed as any).briefs || [];

      const results = [];
      for (const b of briefs) {
        const contentType = b.kind === "blog" ? "blog" : b.kind === "quote" ? "quote" : "journal";
        const topic = b.topic || "The beauty of impermanence";
        const tone = b.tone || "poetic, reflective";

        // Create pipeline run
        const { data: run } = await supa.from("ai_pipeline_runs").insert({
          topic, content_type: contentType, current_step: "initiated", metadata: { tone },
        }).select().single();
        if (!run) continue;

        await supa.from("team_activity_log").insert({
          agent_slug: "aura-director", action: "created_run", entity_type: "pipeline_run", entity_id: run.id,
          details: { topic, kind: b.kind },
        });

        // Run the full pipeline for this brief
        const agentSlug = contentType === "blog" ? "aura-scribe" : contentType === "quote" ? "aura-voice" : "aura-bard";
        const { data: specialist } = await supa.from("ai_agents").select("*").eq("slug", agentSlug).single();
        if (!specialist) continue;

        try {
          // Draft
          await supa.from("ai_pipeline_steps").insert({ run_id: run.id, agent_slug: agentSlug, step_name: "drafting", status: "running", started_at: new Date().toISOString() });
          const draftRaw = await callAI(specialist.model, specialist.system_prompt, `Write about: "${topic}". Tone: ${tone}.`);
          const draft = extractJSON(draftRaw);
          await supa.from("ai_pipeline_steps").update({ status: "complete", output: draft, completed_at: new Date().toISOString() }).eq("run_id", run.id).eq("agent_slug", agentSlug);
          await supa.from("team_activity_log").insert({ agent_slug: agentSlug, action: "drafted", entity_type: "pipeline_run", entity_id: run.id, details: { topic } });

          // Editor
          const { data: editor } = await supa.from("ai_agents").select("*").eq("slug", "aura-editor").single();
          if (editor) {
            await supa.from("ai_pipeline_steps").insert({ run_id: run.id, agent_slug: "aura-editor", step_name: "editing", status: "running", started_at: new Date().toISOString(), input: draft });
            const editRaw = await callAI(editor.model, editor.system_prompt, `Review and refine this draft about "${topic}": ${JSON.stringify(draft)}`);
            const edit = extractJSON(editRaw);
            await supa.from("ai_pipeline_steps").update({ status: "complete", output: edit, completed_at: new Date().toISOString() }).eq("run_id", run.id).eq("agent_slug", "aura-editor");
            await supa.from("team_activity_log").insert({ agent_slug: "aura-editor", action: "edited", entity_type: "pipeline_run", entity_id: run.id, details: { approved: edit.approved } });
            if (edit.revised_body) draft.body = edit.revised_body;
          }

          // Warden
          const { data: warden } = await supa.from("ai_agents").select("*").eq("slug", "aura-warden").single();
          if (warden) {
            await supa.from("ai_pipeline_steps").insert({ run_id: run.id, agent_slug: "aura-warden", step_name: "gate", status: "running", started_at: new Date().toISOString(), input: draft });
            const wardenRaw = await callAI(warden.model, warden.system_prompt, `Check this content for AI mentions, off-brand tone, safety: ${JSON.stringify(draft)}`);
            const gate = extractJSON(wardenRaw);
            await supa.from("ai_pipeline_steps").update({ status: "complete", output: gate, completed_at: new Date().toISOString() }).eq("run_id", run.id).eq("agent_slug", "aura-warden");
            await supa.from("team_activity_log").insert({ agent_slug: "aura-warden", action: "gated", entity_type: "pipeline_run", entity_id: run.id, details: { passes: gate.passes, reason: gate.reason } });
            if (gate.cleaned_body) draft.body = gate.cleaned_body;
            if (!gate.passes) {
              await supa.from("ai_pipeline_runs").update({ current_step: "rejected", updated_at: new Date().toISOString(), metadata: { ...run.metadata, rejection_reason: gate.reason } }).eq("id", run.id);
              results.push({ topic, status: "rejected", reason: gate.reason });
              continue;
            }
          }

          // Titlesmith
          const { data: smith } = await supa.from("ai_agents").select("*").eq("slug", "aura-titlesmith").single();
          if (smith && draft.title) {
            await supa.from("ai_pipeline_steps").insert({ run_id: run.id, agent_slug: "aura-titlesmith", step_name: "polish", status: "running", started_at: new Date().toISOString(), input: { title: draft.title } });
            const titleRaw = await callAI(smith.model, smith.system_prompt, `Rewrite this headline for maximum emotional pull: "${draft.title}"`);
            const titleResult = extractJSON(titleRaw);
            if (titleResult.title) draft.title = titleResult.title;
            await supa.from("ai_pipeline_steps").update({ status: "complete", output: titleResult, completed_at: new Date().toISOString() }).eq("run_id", run.id).eq("agent_slug", "aura-titlesmith");
          }

          // Check human-in-the-loop
          const { data: settings } = await supa.from("site_settings").select("human_in_the_loop,team_active").eq("id", 1).single();
          const hitl = settings?.human_in_the_loop ?? true;

          if (hitl) {
            await supa.from("ai_pipeline_runs").update({ current_step: "held", updated_at: new Date().toISOString(), metadata: { ...run.metadata, final_draft: draft } }).eq("id", run.id);
            results.push({ topic, status: "held_for_approval", run_id: run.id });
          } else {
            // Auto-publish
            const table = contentType === "blog" || contentType === "journal" ? "blog_posts" : "quotes";
            const insertData: any = { title: draft.title || topic, body: draft.body || draft.text || "", author: ATTRIBUTION, status: "published", published_at: new Date().toISOString() };
            if (table === "blog_posts") { insertData.excerpt = draft.excerpt || ""; insertData.tags = draft.tags || []; }
            else { insertData.text = draft.text || draft.body || ""; insertData.source = draft.source || ATTRIBUTION; }
            const { data: inserted, error: pubErr } = await supa.from(table).insert(insertData).select().single();
            if (pubErr) throw new Error(`Publish failed: ${pubErr.message}`);
            await supa.from("ai_pipeline_runs").update({ current_step: "published", target_table: table, target_id: inserted?.id, updated_at: new Date().toISOString() }).eq("id", run.id);
            await supa.from("team_activity_log").insert({ agent_slug: "aura-publisher", action: "published", entity_type: table, entity_id: inserted?.id, details: { run_id: run.id, title: insertData.title, content_type: contentType } });
            results.push({ topic, status: "published", run_id: run.id, target_table: table });
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          await supa.from("ai_pipeline_runs").update({ current_step: "failed", updated_at: new Date().toISOString() }).eq("id", run.id);
          results.push({ topic, status: "failed", error: msg });
        }
      }

      return new Response(JSON.stringify({ success: true, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.action === "run_director") {
      const { data: agent } = await supa.from("ai_agents").select("*").eq("slug", "aura-director").single();
      if (!agent) throw new Error("Director agent not found");

      const { data: recent } = await supa.from("blog_posts").select("title,excerpt").order("created_at", { ascending: false }).limit(5);
      const recentTitles = (recent || []).map((r: any) => r.title).join(", ");

      const userPrompt = `Generate content briefs for this week. Recent posts: ${recentTitles || "none yet"}. Create 3 briefs: one blog post, one quote, one journal entry. Return JSON array.`;
      const raw = await callAI(agent.model, agent.system_prompt, userPrompt);
      const parsed = JSON.parse(raw);

      const briefs = Array.isArray(parsed) ? parsed : (parsed as any).briefs || [];
      const results = [];
      for (const b of briefs) {
        const { data: run } = await supa.from("ai_pipeline_runs").insert({
          topic: b.topic,
          content_type: b.kind === "blog" ? "blog" : b.kind === "quote" ? "quote" : "journal",
          current_step: "initiated",
          metadata: { tone: b.tone || "poetic", agent_slug: b.agent_slug || "aura-scribe" },
        }).select().single();

        if (run) {
          await supa.from("team_activity_log").insert({
            agent_slug: "aura-director",
            action: "created_run",
            entity_type: "pipeline_run",
            entity_id: run.id,
            details: { topic: b.topic, kind: b.kind },
          });
          results.push({ run_id: run.id, topic: b.topic, kind: b.kind });
        }
      }

      return new Response(JSON.stringify({ success: true, created: results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.action === "run_pipeline") {
      const topic = body.topic || "The beauty of impermanence";
      const contentType = body.contentType || "blog";
      const tone = body.tone || "poetic, reflective";

      const { data: run } = await supa.from("ai_pipeline_runs").insert({
        topic,
        content_type: contentType,
        current_step: "initiated",
        metadata: { tone },
      }).select().single();
      if (!run) throw new Error("Failed to create run");

      const agentSlug = contentType === "blog" ? "aura-scribe" : contentType === "quote" ? "aura-voice" : "aura-bard";
      const { data: specialist } = await supa.from("ai_agents").select("*").eq("slug", agentSlug).single();
      if (!specialist) throw new Error(`${agentSlug} not found`);

      // Step 1: Drafting
      await supa.from("ai_pipeline_steps").insert({
        run_id: run.id, agent_slug: agentSlug, step_name: "drafting", status: "running", started_at: new Date().toISOString(),
      });

      const draftPrompt = `Write about: "${topic}". Tone: ${tone}.`;
      const draftRaw = await callAI(specialist.model, specialist.system_prompt, draftPrompt);
      const draft = extractJSON(draftRaw);

      await supa.from("ai_pipeline_steps").update({
        status: "complete", output: draft, completed_at: new Date().toISOString(),
      }).eq("run_id", run.id).eq("agent_slug", agentSlug);

      await supa.from("ai_pipeline_runs").update({ current_step: "editing", updated_at: new Date().toISOString() }).eq("id", run.id);
      await supa.from("team_activity_log").insert({ agent_slug: agentSlug, action: "drafted", entity_type: "pipeline_run", entity_id: run.id, details: { topic, draft_keys: Object.keys(draft) } });

      // Step 2: Editor review
      const { data: editor } = await supa.from("ai_agents").select("*").eq("slug", "aura-editor").single();
      if (editor) {
        await supa.from("ai_pipeline_steps").insert({ run_id: run.id, agent_slug: "aura-editor", step_name: "editing", status: "running", started_at: new Date().toISOString(), input: draft });
        const editPrompt = `Review and refine this draft about "${topic}": ${JSON.stringify(draft)}`;
        const editRaw = await callAI(editor.model, editor.system_prompt, editPrompt);
        const edit = extractJSON(editRaw);
        await supa.from("ai_pipeline_steps").update({ status: "complete", output: edit, completed_at: new Date().toISOString() }).eq("run_id", run.id).eq("agent_slug", "aura-editor");
        await supa.from("team_activity_log").insert({ agent_slug: "aura-editor", action: "edited", entity_type: "pipeline_run", entity_id: run.id, details: { approved: edit.approved } });

        const bodyText = (edit.revised_body as string) || (draft.body as string) || "";
        const titleText = (draft.title as string) || topic;
        draft.body = bodyText;
        draft.title = titleText;
      }

      // Step 3: Warden gate
      const { data: warden } = await supa.from("ai_agents").select("*").eq("slug", "aura-warden").single();
      if (warden) {
        await supa.from("ai_pipeline_steps").insert({ run_id: run.id, agent_slug: "aura-warden", step_name: "gate", status: "running", started_at: new Date().toISOString(), input: draft });
        const wardenPrompt = `Check this content for AI mentions, off-brand tone, safety: ${JSON.stringify(draft)}`;
        const wardenRaw = await callAI(warden.model, warden.system_prompt, wardenPrompt);
        const gate = extractJSON(wardenRaw);
        await supa.from("ai_pipeline_steps").update({ status: "complete", output: gate, completed_at: new Date().toISOString() }).eq("run_id", run.id).eq("agent_slug", "aura-warden");
        await supa.from("team_activity_log").insert({ agent_slug: "aura-warden", action: "gated", entity_type: "pipeline_run", entity_id: run.id, details: { passes: gate.passes, reason: gate.reason } });

        if (gate.cleaned_body) draft.body = gate.cleaned_body;
        if (!gate.passes) {
          await supa.from("ai_pipeline_runs").update({ current_step: "rejected", updated_at: new Date().toISOString(), metadata: { ...run.metadata, rejection_reason: gate.reason } }).eq("id", run.id);
          return new Response(JSON.stringify({ success: false, rejected: true, reason: gate.reason }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      // Step 4: Titlesmith
      const { data: smith } = await supa.from("ai_agents").select("*").eq("slug", "aura-titlesmith").single();
      if (smith && draft.title) {
        await supa.from("ai_pipeline_steps").insert({ run_id: run.id, agent_slug: "aura-titlesmith", step_name: "polish", status: "running", started_at: new Date().toISOString(), input: { title: draft.title } });
        const titlePrompt = `Rewrite this headline for maximum emotional pull: "${draft.title}"`;
        const titleRaw = await callAI(smith.model, smith.system_prompt, titlePrompt);
        const titleResult = extractJSON(titleRaw);
        if (titleResult.title) draft.title = titleResult.title;
        await supa.from("ai_pipeline_steps").update({ status: "complete", output: titleResult, completed_at: new Date().toISOString() }).eq("run_id", run.id).eq("agent_slug", "aura-titlesmith");
      }

      await supa.from("ai_pipeline_runs").update({ current_step: "titlesmith", updated_at: new Date().toISOString() }).eq("id", run.id);

      // Step 5: Check human-in-the-loop
      const { data: settings } = await supa.from("site_settings").select("human_in_the_loop,team_active").eq("id", 1).single();
      const hitl = settings?.human_in_the_loop ?? true;

      if (hitl) {
        await supa.from("ai_pipeline_runs").update({ current_step: "held", updated_at: new Date().toISOString(), metadata: { ...run.metadata, final_draft: draft } }).eq("id", run.id);
        return new Response(JSON.stringify({ success: true, run_id: run.id, status: "held_for_approval", draft }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Auto-publish
      return await publishRun(supa, run.id, draft, topic, contentType);
    }

    if (body.action === "approve" && body.runId) {
      const { data: run } = await supa.from("ai_pipeline_runs").select("*").eq("id", body.runId).single();
      if (!run) throw new Error("Run not found");
      const draft = (run.metadata as any)?.final_draft || {};
      return await publishRun(supa, run.id, draft, run.topic, run.content_type);
    }

    if (body.action === "reject" && body.runId) {
      await supa.from("ai_pipeline_runs").update({ current_step: "rejected", updated_at: new Date().toISOString() }).eq("id", body.runId);
      await supa.from("team_activity_log").insert({ agent_slug: "admin", action: "rejected_run", entity_type: "pipeline_run", entity_id: body.runId });
      return new Response(JSON.stringify({ success: true, rejected: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.action === "publish_held" && body.runId) {
      const { data: run } = await supa.from("ai_pipeline_runs").select("*").eq("id", body.runId).single();
      if (!run) throw new Error("Run not found");
      const draft = (run.metadata as any)?.final_draft || {};
      return await publishRun(supa, run.id, draft, run.topic, run.content_type);
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (body.runId) {
      await supa.from("ai_pipeline_runs").update({ current_step: "failed", updated_at: new Date().toISOString() }).eq("id", body.runId);
    }
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

async function publishRun(supa: any, runId: string, draft: any, topic: string, contentType: string): Promise<Response> {
  const table = contentType === "blog" || contentType === "journal" ? "blog_posts" : "quotes";

  const insertData: any = {
    title: draft.title || topic,
    body: draft.body || draft.text || "",
    author: ATTRIBUTION,
    status: "published",
    published_at: new Date().toISOString(),
  };

  if (table === "blog_posts") {
    insertData.excerpt = draft.excerpt || "";
    insertData.tags = draft.tags || [];
  } else {
    insertData.text = draft.text || draft.body || "";
    insertData.source = draft.source || ATTRIBUTION;
  }

  const { data: inserted, error } = await supa.from(table).insert(insertData).select().single();
  if (error) throw new Error(`Publish failed: ${error.message}`);

  await supa.from("ai_pipeline_runs").update({
    current_step: "published",
    target_table: table,
    target_id: inserted?.id,
    updated_at: new Date().toISOString(),
  }).eq("id", runId);

  await supa.from("team_activity_log").insert({
    agent_slug: "aura-publisher",
    action: "published",
    entity_type: table,
    entity_id: inserted?.id,
    details: { run_id: runId, title: insertData.title, content_type: contentType },
  });

  return new Response(JSON.stringify({ success: true, run_id: runId, status: "published", target_table: table, target_id: inserted?.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
