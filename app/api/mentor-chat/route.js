import { callGroqConversation } from "@/lib/groq";
import { buildMentorPrompt } from "@/lib/prompts";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(request) {
  try {
    const { uid, message, history } = await request.json();

    if (!uid || !message) {
      return Response.json({ error: "Missing data" }, { status: 400 });
    }

    const userSnap = await adminDb.collection("users").doc(uid).get();
    const userData = userSnap.data();

    if (!userData) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const systemPrompt = buildMentorPrompt(userData);

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const reply = await callGroqConversation(messages, {
      temperature: 0.7,
      maxTokens: 1000,
    });

    return Response.json({ reply });
  } catch (err) {
    console.error("Mentor chat error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}