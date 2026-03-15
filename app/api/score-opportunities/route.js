import { callGroqJSON } from "@/lib/groq";
import { buildScoringPrompt } from "@/lib/prompts";

export async function POST(request) {
  try {
    const { user, opportunities } = await request.json();

    if (!user || !opportunities?.length) {
      return Response.json({ error: "Missing data" }, { status: 400 });
    }

    // Separate jobs from grants/courses/fellowships
    const jobs = opportunities.filter((o) => o.type === "job");
    const others = opportunities.filter((o) => o.type !== "job");

    // Score up to 10 jobs and ALL grants/courses/fellowships
    const toScore = [
      ...jobs.slice(0, 10),
      ...others,
    ];

    const scored = [];
    const batchSize = 5;

    for (let i = 0; i < toScore.length; i += batchSize) {
      const batch = toScore.slice(i, i + batchSize);
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

    // Add unscored jobs at the end
    const unscoredJobs = jobs.slice(10).map((o) => ({
      ...o,
      score: 0,
      label: "Low Match",
      reason: "",
    }));

    const all = [...scored, ...unscoredJobs];
    all.sort((a, b) => b.score - a.score);

    return Response.json({ scored: all });
  } catch (err) {
    console.error("Scoring error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
