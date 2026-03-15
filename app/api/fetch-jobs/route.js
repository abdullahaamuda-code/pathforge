import { fetchJobs } from "@/lib/jobs";

export async function POST(request) {
  try {
    const { user } = await request.json();
    if (!user) return Response.json({ error: "Missing user" }, { status: 400 });

    const jobs = await fetchJobs(user);
    return Response.json({ jobs });
  } catch (err) {
    console.error("Fetch jobs error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
