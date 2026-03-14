import { callGroqJSON } from "@/lib/groq";
import { buildScoringPrompt } from "@/lib/prompts";

export async function POST(request) {
  try {
    const { user, opportunities } = await request.json();

    if (!user || !opportunities?.length) {
      return Response.json({ error: "Missing data" }, { status: 400 });
    }

    // Score in batches of 5 to avoid rate limits
    const scored = [];
    const batchSize = 5;

    for (let i = 0; i < Math.min(opportunities.length, 15); i += batchSize) {
      const batch = opportunities.slice(i, i + batchSize);
      const batchPromises = batch.map(async (opp) => {
        try {
          const { system, user: userMsg } = buildScoringPrompt(user, opp);
         const result = await callGroqJSON(system, userMsg, {
  temperature: 0.3,
  maxTokens: 200,
  pool: "scoring",
});
          return {
            ...opp,
            score: result.score || 0,
            label: result.label || "Low Match",
            reason: result.reason || "",
          };
        } catch {
          return { ...opp, score: 0, label: "Low Match", reason: "" };
        }
      });
      const batchResults = await Promise.all(batchPromises);
      scored.push(...batchResults);
    }

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return Response.json({ scored });
  } catch (err) {
    console.error("Scoring error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}