export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const repoOwner = process.env.GITHUB_REPO_OWNER;
    const repoName = process.env.GITHUB_REPO_NAME;
    const token = process.env.GITHUB_TOKEN;

    if (!repoOwner || !repoName || !token) {
      return Response.json({ error: "GitHub config missing — check GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME in env variables" }, { status: 500 });
    }

    const res = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/actions/workflows/scraper.yml/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ref: "main" }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`GitHub API error ${res.status}: ${err}`);
    }

    // Get latest workflow run to confirm it started
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const runsRes = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/actions/workflows/scraper.yml/runs?per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const runsData = await runsRes.json();
    const latestRun = runsData.workflow_runs?.[0];

    return Response.json({
      success: true,
      message: "Scraper triggered successfully",
      run: latestRun ? {
        id: latestRun.id,
        status: latestRun.status,
        url: latestRun.html_url,
        startedAt: latestRun.created_at,
      } : null,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
