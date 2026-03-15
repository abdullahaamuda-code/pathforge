import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const [usersSnap, opportunitiesSnap, savedSnap, roadmapsSnap] = await Promise.all([
      adminDb.collection("users").get(),
      adminDb.collection("opportunities").get(),
      adminDb.collection("saved").get(),
      adminDb.collection("roadmaps").get(),
    ]);

    const users = usersSnap.docs.map((d) => d.data());

    // Stage breakdown
    const stageBreakdown = users.reduce((acc, u) => {
      acc[u.stage || "unknown"] = (acc[u.stage || "unknown"] || 0) + 1;
      return acc;
    }, {});

    // Country breakdown
    const countryBreakdown = users.reduce((acc, u) => {
      acc[u.country || "unknown"] = (acc[u.country || "unknown"] || 0) + 1;
      return acc;
    }, {});

    // Signups per day last 7 days
    const now = new Date();
    const signupsPerDay = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      signupsPerDay[d.toISOString().split("T")[0]] = 0;
    }
    users.forEach((u) => {
      if (u.createdAt) {
        const date = u.createdAt.toDate?.()?.toISOString().split("T")[0];
        if (date && signupsPerDay[date] !== undefined) {
          signupsPerDay[date]++;
        }
      }
    });

    // Onboarding completion rate
    const completedOnboarding = users.filter((u) => u.onboardingComplete).length;

    return Response.json({
      totalUsers: users.length,
      completedOnboarding,
      onboardingRate: users.length > 0 ? Math.round((completedOnboarding / users.length) * 100) : 0,
      totalOpportunities: opportunitiesSnap.size,
      totalSaved: savedSnap.size,
      totalRoadmaps: roadmapsSnap.size,
      stageBreakdown,
      countryBreakdown,
      signupsPerDay,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
