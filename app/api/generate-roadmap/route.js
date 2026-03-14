import { callGroqJSON } from "@/lib/groq";
import { buildRoadmapPrompt } from "@/lib/prompts";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(request) {
  try {
    const { uid, user } = await request.json();

    if (!uid || !user) {
      return Response.json({ error: "Missing uid or user" }, { status: 400 });
    }

    const { system, user: userMessage } = buildRoadmapPrompt(user);

const result = await callGroqJSON(system, userMessage, {
  temperature: 0.6,
  maxTokens: 3000,
  pool: "roadmap",
});

    if (!result || !result.careerPaths) {
      return Response.json({ error: "Invalid AI response" }, { status: 500 });
    }

    // Save to Firestore
    await adminDb.collection("roadmaps").doc(uid).set({
      uid,
      ...result,
      generatedAt: new Date(),
      version: 1,
    });

    return Response.json({ success: true, roadmap: result });
  } catch (err) {
    console.error("Roadmap generation error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}