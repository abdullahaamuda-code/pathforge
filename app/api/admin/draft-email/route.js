export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Groq from "groq-sdk";

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY_ADMIN_1 || process.env.GROQ_API_KEY,
    });

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an email writer for PathForge — an AI career guidance platform for African students. Write professional, warm, and concise emails on behalf of PathForge. Always return a JSON object with exactly two fields: "subject" (the email subject line) and "message" (the email body text, plain text not HTML, max 200 words). No markdown, no extra fields.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    return Response.json({ subject: parsed.subject || "", message: parsed.message || "" });
  } catch (err) {
    console.error("Draft email error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
