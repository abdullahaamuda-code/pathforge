import { callGroq } from "@/lib/groq";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(request) {
  try {
    const { message, history } = await request.json();

    // Fetch platform data for context
    const [usersSnap, opportunitiesSnap, savedSnap, roadmapsSnap] = await Promise.all([
      adminDb.collection("users").get(),
      adminDb.collection("opportunities").get(),
      adminDb.collection("saved").get(),
      adminDb.collection("roadmaps").get(),
    ]);

    const users = usersSnap.docs.map((d) => d.data());
    const stageBreakdown = users.reduce((acc, u) => {
      acc[u.stage || "unknown"] = (acc[u.stage || "unknown"] || 0) + 1;
      return acc;
    }, {});
    const countryBreakdown = users.reduce((acc, u) => {
      acc[u.country || "unknown"] = (acc[u.country || "unknown"] || 0) + 1;
      return acc;
    }, {});

    const platformData = {
      totalUsers: users.length,
      completedOnboarding: users.filter((u) => u.onboardingComplete).length,
      totalOpportunities: opportunitiesSnap.size,
      totalSaved: savedSnap.size,
      totalRoadmaps: roadmapsSnap.size,
      stageBreakdown,
      countryBreakdown,
    };

    const systemPrompt = `You are the PathForge admin AI advisor. You have full access to the platform's data and help the founder make smart decisions about the product.

Current platform data:
${JSON.stringify(platformData, null, 2)}

You analyze this data and give sharp, direct insights. You suggest announcements, identify growth patterns, flag issues, and recommend actions. You're direct and concise — no fluff. You know this is an AI career guidance platform for African students and graduates.`;

    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY_ADMIN_1 || process.env.GROQ_API_KEY });

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: message },
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const reply = response.choices[0]?.message?.content || "";
    return Response.json({ reply });
  } catch (err) {
    console.error("Admin AI error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
