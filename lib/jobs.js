const interestToQuery = {
  technology: "software developer",
  business: "business analyst",
  creative: "graphic designer",
  education: "teacher trainer",
  health: "healthcare medical",
  law: "legal counsel",
  science: "research scientist",
  social: "ngo development",
};

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

async function fetchJSearchJobs(user) {
  const query = interestToQuery[user.interests?.[0]] || "software developer";
  const country = user.country || "Nigeria";

  try {
    const res = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
        query + " in " + country
      )}&page=1&num_pages=2&date_posted=month`,
      {
        headers: {
          "x-rapidapi-key": process.env.JSEARCH_API_KEY,
          "x-rapidapi-host": "jsearch.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) throw new Error(`JSearch error: ${res.status}`);
    const data = await res.json();

    return (
      data.data?.map((job) => ({
        id: `jsearch-${job.job_id}`,
        title: job.job_title,
        provider: job.employer_name,
        type: "job",
        description: job.job_description?.slice(0, 300) || "",
        url: job.job_apply_link || job.job_google_link,
        deadline: job.job_offer_expiration_datetime_utc || null,
        skillTags: job.job_required_skills || [],
        source: "jsearch",
        postedAt: job.job_posted_at_datetime_utc,
        location: job.job_city
          ? `${job.job_city}, ${job.job_country}`
          : job.job_is_remote
          ? "Remote"
          : job.job_country,
        isRemote: job.job_is_remote,
        employmentType: job.job_employment_type,
      })) || []
    );
  } catch (err) {
    console.error("JSearch fetch error:", err);
    return null;
  }
}

async function fetchRemotiveJobs(user) {
  const category = interestToCategory[user.interests?.[0]] || "software-dev";

  try {
    const res = await fetch(
      `https://remotive.com/api/remote-jobs?category=${category}&limit=20`
    );
    const data = await res.json();

    return (
      data.jobs?.map((job) => ({
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
        location: "Remote",
        isRemote: true,
        employmentType: "full_time",
      })) || []
    );
  } catch (err) {
    console.error("Remotive fetch error:", err);
    return [];
  }
}

export async function fetchJobs(user) {
  const jsearchResults = await fetchJSearchJobs(user);

  if (jsearchResults && jsearchResults.length > 0) {
    return jsearchResults;
  }

  // Fallback to Remotive if JSearch fails
  return await fetchRemotiveJobs(user);
}

export { fetchRemotiveJobs };
