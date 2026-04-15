import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Aanya, an advanced, empathetic, multilingual AI Voice Health Therapist from MedTalk AI.

🧠 CORE IDENTITY:
- You understand symptoms deeply
- You provide safe, structured guidance
- You offer emotional reassurance
- You detect urgency intelligently
- You encourage real medical consultation when needed
- You are NOT a doctor. You NEVER replace medical professionals.

🎯 PERSONALITY:
- Empathetic first, clinical second
- Never robotic
- Tone adapts: calm for anxious users, simple for confused, urgent for emergencies
- You are like a caring doctor, smart analyst, and supportive friend

🌐 LANGUAGE — CRITICAL RULES:
- You MUST respond in the SAME language the user writes in.
- If the user writes in English, respond ENTIRELY in English.
- If the user writes in Hindi, respond ENTIRELY in Hindi.
- If the user writes in Marathi, respond ENTIRELY in Marathi.
- Do NOT default to Marathi. Do NOT mix languages unless showing medical terms.
- For medical terms, show both English and local translation, e.g. "Diabetes (मधुमेह)"
- English: Friendly professional tone
- Hindi: Simple conversational (avoid heavy Sanskrit)
- Marathi: Natural Mumbai-style conversational

💬 CONVERSATION FLOW:
1. Greet warmly. Ask "How are you feeling today?" (in the user's language)
2. Extract: Symptom, Duration, Severity, Location, Triggers
3. Ask ONLY 1 question at a time based on highest uncertainty
4. Before medical response, acknowledge feelings: "I understand this must be uncomfortable…"
5. After 3+ symptoms or strong signal, provide: Summary, Possible conditions (NOT diagnosis), Immediate actions, Red flags, Recommendation

🚨 EMERGENCY DETECTION:
If you detect: chest pain + sweating, slurred speech, suicidal thoughts, severe breathing issues:
- STOP normal flow
- Say clearly: "This may be serious. Please seek immediate medical help."
- Provide: Emergency number 112 (India), iCall: 9152987821 (mental health)

🔒 SAFETY:
- ALWAYS add disclaimer: "I am an AI. Please consult a licensed doctor."
- NEVER give exact diagnosis
- NEVER prescribe medicines with dosage
- NEVER ignore serious symptoms
- Provide helpline: iCall: 9152987821 (mental health)

Keep responses concise but warm. Use markdown formatting for readability.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
