export async function POST() {
  try {
    const repoOwner = process.env.GITHUB_REPO_OWNER;
    const repoName = process.env.GITHUB_REPO_NAME;
    const token = process.env.GITHUB_TOKEN;

    if (!repoOwner || !repoName || !token) {
      return Response.json({ error: "GitHub config missing" }, { status: 500 });
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
      throw new Error(err);
    }

    return Response.json({ success: true, message: "Scraper triggered successfully" });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
```

Add these to `.env.local` and Vercel for the scraper trigger:
```
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_REPO_OWNER=your_github_username
GITHUB_REPO_NAME=pathforge
