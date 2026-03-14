export async function fetchRemotiveJobs(user) {
  const interestToCategory = {
    technology: "software-dev",
    business: "business",
    creative: "design",
    education: "teaching-languages",
    health: "medical-health",
    law: "legal",
    science: "science",
    social: "non-profit",
  };

  const category = interestToCategory[user.interests?.[0]] || "software-dev";

  try {
    const res = await fetch(
      `https://remotive.com/api/remote-jobs?category=${category}&limit=20`
    );
    const data = await res.json();
    return data.jobs?.map((job) => ({
      id: `remotive-${job.id}`,
      title: job.title,
      provider: job.company_name,
      type: "job",
      description: job.description?.replace(/<[^>]*>/g, "").slice(0, 300),
      url: job.url,
      deadline: null,
      skillTags: job.tags || [],
      source: "remotive",
      postedAt: job.publication_date,
    })) || [];
  } catch (err) {
    console.error("Remotive fetch error:", err);
    return [];
  }
}