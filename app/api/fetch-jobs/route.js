import { fetchJobs, fetchFilteredRemotiveJobs } from "@/lib/jobs";

export async function POST(request) {
  try {
    const { user } = await request.json();
    if (!user) return Response.json({ error: "Missing user" }, { status: 400 });

    // Fetch both in parallel
    const [jsearchJobs, remotiveJobs] = await Promise.all([
      fetchJobs(user),
      fetchFilteredRemotiveJobs(user),
    ]);

    // Merge and deduplicate by title+provider
    const seen = new Set();
    const merged = [...jsearchJobs, ...remotiveJobs].filter((job) => {
      const key = `${job.title}-${job.provider}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return Response.json({ jobs: merged });
  } catch (err) {
    console.error("Fetch jobs error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
