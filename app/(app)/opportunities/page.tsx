"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUser, getOpportunities, saveOpportunity, getSaved, saveUserOpportunities, getUserOpportunities, saveUserJobs, getUserJobs } from "@/lib/firestore";
import Link from "next/link";
import React from "react";

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
    const saved = await getSaved(user.uid);
    setSavedIds(new Set(saved.map((s: any) => s.opportunityId)));

    // Check scored opportunities cache (24hr)
    const cached = await getUserOpportunities(user.uid);
    if (cached) {
      setOpportunities(cached);
      setLoading(false);
      return;
    }

    // Check monthly jobs cache (30 days)
    const cachedJobs = await getUserJobs(user.uid);

    // Get scraped opportunities (grants, courses, fellowships)
    const scraped = await getOpportunities();

    let jobs = [];
    if (cachedJobs && cachedJobs.length > 0) {
      // Use cached jobs — don't hit JSearch API
      jobs = cachedJobs;
    } else {
      // Fetch fresh from JSearch (uses 1 API call)
      const jobRes = await fetch("/api/fetch-jobs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ user: userData }),
});
const jobData = await jobRes.json();
jobs = jobData.jobs || [];
      // Save to 30-day cache
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
    setError("Failed to load opportunities. Please try again.");
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
      setSavedIds((prev) => new Set(Array.from(prev).concat(opp.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  }

  const filtered = filter === "all"
    ? opportunities
    : opportunities.filter((o) => o.type === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 bg-[#7F77DD] rounded-lg animate-pulse flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 14 L9 4 L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 10.5 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-[#888780] text-sm">Finding opportunities for you...</p>
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
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080a0f] text-white pb-24">

      {/* Nav */}
      <div className="border-b border-[#2C2C2A] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#080a0f] z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#7F77DD] rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M4 14 L9 4 L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 10.5 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white font-medium text-sm">PathForge</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-[#888780] text-xs hover:text-white transition">Dashboard</Link>
          <Link href="/roadmap" className="text-[#888780] text-xs hover:text-white transition">Roadmap</Link>
          <Link href="/opportunities" className="text-white text-xs font-medium">Opportunities</Link>
          <Link href="/saved" className="text-[#888780] text-xs hover:text-white transition">Saved</Link>
          <Link href="/mentor" className="text-[#888780] text-xs hover:text-white transition">AI Mentor</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[#444441] text-xs mb-1">Matched to your profile</p>
            <h1 className="text-white text-xl font-medium">Opportunities for you</h1>
          </div>
          {scoring && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#7F77DD] animate-pulse" />
              <span className="text-[#888780] text-xs">Scoring matches...</span>
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
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
            </button>
          ))}
        </div>

        {/* Opportunities list */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#444441] text-sm">No {filter === "all" ? "" : filter} opportunities found yet.</p>
            <p className="text-[#444441] text-xs mt-2">Check back soon as we update our database regularly.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((opp) => (
              <div
                key={opp.id}
                className="border border-[#2C2C2A] bg-[#0f1117] rounded-xl p-5 hover:border-[#444441] transition"
              >
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
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#2C2C2A] text-[#444441]">
                          Scoring...
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
    {opp.isRemote ? "Remote" : opp.location}
  </p>
)}
                  </div>
                  {opp.score !== null && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-[#7F77DD] text-lg font-medium">{opp.score}%</p>
                      <p className="text-[#444441] text-[10px]">match</p>
                    </div>
                  )}
                </div>

                {opp.reason && (
                  <p className="text-[#888780] text-xs leading-relaxed mb-3 border-l-2 border-[#2C2C2A] pl-3">
                    {opp.reason}
                  </p>
                )}

                {opp.deadline && (
                  <p className="text-[#444441] text-xs mb-3">
                    Deadline: {new Date(opp.deadline).toLocaleDateString()}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <a
                    href={opp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#534AB7] hover:bg-[#4840a0] text-white text-xs px-4 py-2 rounded-lg transition"
                  >
                    Apply now
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
                    {savedIds.has(opp.id) ? "Saved ✓" : savingId === opp.id ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      const question = `I found this opportunity: "${opp.title}" by ${opp.provider}. Can you tell me more about it, whether it's worth applying for based on my profile, and how I should approach the application?`;
                      localStorage.setItem(`pathforge_mentor_prompt_${user.uid}`, question);
                      window.location.href = "/mentor";
                    }}
                    className="text-xs px-4 py-2 rounded-lg border border-[#2C2C2A] text-[#7F77DD] hover:border-[#7F77DD]/40 transition"
                  >
                    Ask AI →
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
    { label: "Home", href: "/dashboard", icon: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" strokeWidth="1.5"/> },
    { label: "Roadmap", href: "/roadmap", icon: <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeWidth="1.5"/> },
    { label: "Explore", href: "/opportunities", icon: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="1.5"/> },
    { label: "Saved", href: "/saved", icon: <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeWidth="1.5"/> },
    { label: "Mentor", href: "/mentor", icon: <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth="1.5"/> },
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
