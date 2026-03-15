"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUser, getOpportunities, saveOpportunity, getSaved, saveUserOpportunities, getUserOpportunities, saveUserJobs, getUserJobs } from "@/lib/firestore";
import Link from "next/link";
import { t } from "@/lib/i18n";

const labelColors = {
  "Strong Match": "bg-green-900/30 text-green-400 border border-green-800/40",
  "Good Match": "bg-blue-900/30 text-blue-400 border border-blue-800/40",
  "Possible Match": "bg-yellow-900/30 text-yellow-400 border border-yellow-800/40",
  "Low Match": "bg-[#1a1c23] text-[#888780] border border-[#2C2C2A]",
};

const typeColors = {
  job: "bg-[#1a1830] text-[#7F77DD] border border-[#7F77DD]/20",
  grant: "bg-green-900/20 text-green-400 border border-green-800/30",
  course: "bg-orange-900/20 text-orange-400 border border-orange-800/30",
  fellowship: "bg-purple-900/20 text-purple-400 border border-purple-800/30",
};

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) loadOpportunities();
  }, [user]);

  async function loadOpportunities() {
    setLoading(true);
    setError("");
    try {
      const userData = await getUser(user.uid);
      setLang(userData?.language || "en");
      const saved = await getSaved(user.uid);
      setSavedIds(new Set(saved.map((s: any) => s.opportunityId)));

      const cached = await getUserOpportunities(user.uid);
      if (cached) {
        setOpportunities(cached);
        setLoading(false);
        return;
      }

      const cachedJobs = await getUserJobs(user.uid);
      const scraped = await getOpportunities();

      let jobs = [];
      if (cachedJobs && cachedJobs.length > 0) {
        jobs = cachedJobs;
      } else {
        const jobRes = await fetch("/api/fetch-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: userData }),
        });
        const jobData = await jobRes.json();
        jobs = jobData.jobs || [];
        if (jobs.length > 0) {
          await saveUserJobs(user.uid, jobs);
        }
      }

      const all = [...jobs, ...scraped];
      setOpportunities(all.map((o) => ({ ...o, score: null, label: null })));
      setLoading(false);
      setScoring(true);
      await scoreAndCache(userData, all);
    } catch (err) {
      console.error(err);
      setError(lang === "fr" ? "Échec du chargement. Réessayez." : "Failed to load opportunities. Please try again.");
      setLoading(false);
    }
  }

  async function scoreAndCache(userData, opps) {
    try {
      const res = await fetch("/api/score-opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userData, opportunities: opps }),
      });
      const data = await res.json();
      if (data.scored) {
        setOpportunities(data.scored);
        await saveUserOpportunities(user.uid, data.scored);
      }
    } catch (err) {
      console.error("Scoring failed:", err);
    } finally {
      setScoring(false);
    }
  }

  async function handleSave(opp) {
    if (savedIds.has(opp.id)) return;
    setSavingId(opp.id);
    try {
      await saveOpportunity(user.uid, opp.id, {
        title: opp.title,
        provider: opp.provider,
        type: opp.type,
        url: opp.url,
        deadline: opp.deadline || null,
      });
      setSavedIds((prev) => new Set([...prev, opp.id]));
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  }

  const filtered = filter === "all"
    ? opportunities
    : opportunities.filter((o) => o.type === filter);

  const filterLabels = {
    all: lang === "fr" ? "Tout" : "All",
    job: lang === "fr" ? "Emplois" : "Jobs",
    grant: lang === "fr" ? "Bourses" : "Grants",
    course: lang === "fr" ? "Cours" : "Courses",
    fellowship: lang === "fr" ? "Fellowships" : "Fellowships",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 bg-[#7F77DD] rounded-lg animate-pulse flex items-center justify-center">
<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5" opacity="0.5"/>
  <polygon points="12,5 14.5,11.5 12,10 9.5,11.5" fill="white"/>
  <circle cx="12" cy="18" r="1.5" fill="white" opacity="0.5"/>
  <line x1="5" y1="12" x2="7" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  <line x1="17" y1="12" x2="19" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
</svg>
        </div>
        <p className="text-[#888780] text-sm">{t(lang, "opportunities.findingOpportunities")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={loadOpportunities}
          className="bg-[#534AB7] text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-[#4840a0] transition"
        >
          {lang === "fr" ? "Réessayer" : "Try again"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080a0f] text-white pb-28 relative">

      {/* Nav */}
      <div className="border-b border-[#2C2C2A] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#080a0f] z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#7F77DD] rounded-lg flex items-center justify-center">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5" opacity="0.5"/>
    <polygon points="12,5 14.5,11.5 12,10 9.5,11.5" fill="white"/>
    <circle cx="12" cy="18" r="1.5" fill="white" opacity="0.5"/>
    <line x1="5" y1="12" x2="7" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <line x1="17" y1="12" x2="19" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>
</div>

          <span className="text-white font-medium text-sm">PathForge</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-[#888780] text-xs hover:text-white transition">Dashboard</Link>
          <Link href="/roadmap" className="text-[#888780] text-xs hover:text-white transition">{t(lang, "nav.roadmap")}</Link>
          <Link href="/opportunities" className="text-white text-xs font-medium">{t(lang, "dashboard.opportunities")}</Link>
          <Link href="/saved" className="text-[#888780] text-xs hover:text-white transition">{t(lang, "dashboard.saved")}</Link>
          <Link href="/mentor" className="text-[#888780] text-xs hover:text-white transition">{t(lang, "dashboard.aiMentor")}</Link>
        </div>
      </div>

      {/* Mobile back bar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#2C2C2A] md:hidden">
        <button onClick={() => window.history.back()} className="text-[#888780] active:text-white transition">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-white text-sm font-medium">{t(lang, "opportunities.forYou")}</span>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[#888780] text-xs mb-1">{t(lang, "opportunities.matchedToProfile")}</p>
            <h1 className="text-white text-xl font-medium">{t(lang, "opportunities.forYou")}</h1>
          </div>
          {scoring && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#7F77DD] animate-pulse" />
              <span className="text-[#888780] text-xs">{t(lang, "opportunities.scoringMatches")}</span>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {["all", "job", "grant", "course", "fellowship"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                filter === f
                  ? "bg-[#534AB7] text-white"
                  : "border border-[#2C2C2A] text-[#888780] hover:border-[#444441]"
              }`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>

        {/* Opportunities list */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#888780] text-sm">{t(lang, "opportunities.noOpportunities")}</p>
            <p className="text-[#888780] text-xs mt-2">{t(lang, "opportunities.checkBack")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((opp) => (
              <div key={opp.id} className="border border-[#2C2C2A] bg-[#0f1117] rounded-xl p-5 hover:border-[#444441] transition">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[opp.type] || typeColors.job}`}>
                        {opp.type}
                      </span>
                      {opp.label && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${labelColors[opp.label]}`}>
                          {opp.label}
                        </span>
                      )}
                      {!opp.label && scoring && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#2C2C2A] text-[#888780]">
                          {t(lang, "opportunities.scoringMatches")}
                        </span>
                      )}
                    </div>
                    <p className="text-white text-sm font-medium leading-snug">{opp.title}</p>
                    <p className="text-[#888780] text-xs mt-0.5">{opp.provider}</p>
                    {opp.location && (
                      <p className="text-[#444441] text-[10px] mt-0.5 flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        {opp.isRemote ? (lang === "fr" ? "À distance" : "Remote") : opp.location}
                      </p>
                    )}
                    {opp.source === "jsearch" && (
                      <p className="text-[#444441] text-[10px] mt-0.5">
                        {lang === "fr" ? "Annonce externe — vérifiez qu'elle est encore active avant de postuler" : "External listing — verify it's still active before applying"}
                      </p>
                    )}
                  </div>
                  {opp.score !== null && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-[#7F77DD] text-lg font-medium">{opp.score}%</p>
                      <p className="text-[#888780] text-[10px]">{t(lang, "opportunities.match")}</p>
                    </div>
                  )}
                </div>

                {opp.reason && (
                  <p className="text-[#888780] text-xs leading-relaxed mb-3 border-l-2 border-[#2C2C2A] pl-3">
                    {opp.reason}
                  </p>
                )}

                {opp.deadline && (
                  <p className="text-[#888780] text-xs mb-3">
                    {t(lang, "opportunities.deadline")}: {new Date(opp.deadline).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB")}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <a
                    href={opp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#534AB7] hover:bg-[#4840a0] text-white text-xs px-4 py-2 rounded-lg transition"
                  >
                    {t(lang, "opportunities.applyNow")}
                  </a>
                  <button
                    onClick={() => handleSave(opp)}
                    disabled={savedIds.has(opp.id) || savingId === opp.id}
                    className={`text-xs px-4 py-2 rounded-lg border transition ${
                      savedIds.has(opp.id)
                        ? "border-[#7F77DD]/30 text-[#7F77DD] cursor-default"
                        : "border-[#2C2C2A] text-[#888780] hover:border-[#444441] hover:text-white"
                    }`}
                  >
                    {savedIds.has(opp.id) ? `${t(lang, "opportunities.saved")} ✓` : savingId === opp.id ? t(lang, "opportunities.saving") : t(lang, "opportunities.save")}
                  </button>
                  <button
                    onClick={() => {
                      const question = lang === "fr"
                        ? `J'ai trouvé cette opportunité: "${opp.title}" par ${opp.provider}. Pouvez-vous m'en dire plus et comment postuler ?`
                        : `I found this opportunity: "${opp.title}" by ${opp.provider}. Can you tell me more about it and how I should approach the application?`;
                      localStorage.setItem(`pathforge_mentor_prompt_${user.uid}`, question);
                      window.location.href = "/mentor";
                    }}
                    className="text-xs px-4 py-2 rounded-lg border border-[#2C2C2A] text-[#7F77DD] hover:border-[#7F77DD]/40 transition"
                  >
                    {t(lang, "opportunities.askAI")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[#2C2C2A] bg-[#080a0f] px-6 py-3 flex items-center justify-around md:hidden z-10">
        {[
          { label: t(lang, "nav.home"), href: "/dashboard", icon: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" strokeWidth="1.5"/> },
          { label: t(lang, "nav.roadmap"), href: "/roadmap", icon: <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeWidth="1.5"/> },
          { label: t(lang, "nav.explore"), href: "/opportunities", icon: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="1.5"/> },
          { label: t(lang, "nav.saved"), href: "/saved", icon: <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeWidth="1.5"/> },
          { label: t(lang, "nav.mentor"), href: "/mentor", icon: <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth="1.5"/> },
        ].map((item) => {
          const isActive = item.href === "/opportunities";
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke={isActive ? "#ffffff" : "#888780"}
                strokeLinecap="round" strokeLinejoin="round">
                {item.icon}
              </svg>
              <span className={`text-[10px] font-medium ${isActive ? "text-white" : "text-[#888780]"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
