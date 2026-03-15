"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUser, getRoadmap } from "@/lib/firestore";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { t, interpolate } from "@/lib/i18n";

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    try {
      const [userData, roadmapData] = await Promise.all([
        getUser(user.uid),
        getRoadmap(user.uid),
      ]);
      setProfile(userData);
      setRoadmap(roadmapData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    document.cookie = "__session=; path=/; max-age=0";
    await signOut(auth);
    window.location.href = "/login";
  }

  const lang = profile?.language || "en";
  const topPath = roadmap?.careerPaths?.[0];
  const skillGapCount = roadmap?.skillGaps?.length || 0;
  const quickWin = roadmap?.quickWins?.[0];

  const today = new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const stageLabel = {
    secondary: lang === "fr" ? "Lycée" : "Secondary school",
    applicant: lang === "fr" ? "Candidat à l'université" : "University applicant",
    undergraduate: lang === "fr" ? "Étudiant" : "Undergraduate",
    graduate: lang === "fr" ? "Diplômé" : "Graduate",
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t(lang, "dashboard.goodMorning");
    if (hour < 17) return t(lang, "dashboard.goodAfternoon");
    return t(lang, "dashboard.goodEvening");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center">
        <div className="w-7 h-7 bg-[#7F77DD] rounded-lg animate-pulse flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5" opacity="0.5"/>
  <polygon points="12,5 14.5,11.5 12,10 9.5,11.5" fill="white"/>
  <circle cx="12" cy="18" r="1.5" fill="white" opacity="0.5"/>
  <line x1="5" y1="12" x2="7" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  <line x1="17" y1="12" x2="19" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
</svg>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080a0f] text-white">

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
          <Link href="/dashboard" className="text-white text-xs font-medium">Dashboard</Link>
          <Link href="/roadmap" className="text-[#888780] text-xs hover:text-white transition">{t(lang, "nav.roadmap")}</Link>
          <Link href="/opportunities" className="text-[#888780] text-xs hover:text-white transition">{t(lang, "dashboard.opportunities")}</Link>
          <Link href="/saved" className="text-[#888780] text-xs hover:text-white transition">{t(lang, "dashboard.saved")}</Link>
          <Link href="/mentor" className="text-[#888780] text-xs hover:text-white transition">{t(lang, "dashboard.aiMentor")}</Link>
        </div>

        <button onClick={handleSignOut} className="text-[#444441] text-xs hover:text-[#888780] transition">
          {t(lang, "dashboard.signOut")}
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <p className="text-[#444441] text-xs mb-1">{today}</p>
          <h1 className="text-white text-2xl font-medium mb-1">
            {greeting()}, {profile?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-[#888780] text-sm">
            {stageLabel[profile?.stage] || "Student"}
            {profile?.country ? ` · ${profile.country}` : ""}
            {profile?.interests?.length ? ` · ${profile.interests[0]}` : ""}
          </p>
        </div>

        {/* Top two cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          {topPath ? (
            <Link href="/roadmap" className="block">
              <div className="border border-[#7F77DD]/20 bg-[#1a1830] rounded-xl p-5 hover:border-[#7F77DD]/40 transition h-full">
                <p className="text-[#7F77DD] text-[10px] font-medium tracking-widest uppercase mb-3">
                  {t(lang, "dashboard.topCareerMatch")}
                </p>
                <p className="text-white text-base font-medium mb-1">{topPath.title}</p>
                <p className="text-[#888780] text-xs mb-4">
                  {topPath.growthOutlook} growth · {topPath.timeToEntry} to entry
                </p>
                <div className="flex items-end justify-between">
                  <p className="text-[#7F77DD] text-3xl font-medium">{topPath.matchScore}%</p>
                  <span className="text-[#7F77DD] text-xs">{t(lang, "dashboard.viewRoadmap")}</span>
                </div>
              </div>
            </Link>
          ) : (
            <Link href="/roadmap" className="block">
              <div className="border border-[#2C2C2A] bg-[#0f1117] rounded-xl p-5 hover:border-[#444441] transition h-full">
                <p className="text-[#444441] text-[10px] font-medium tracking-widest uppercase mb-3">
                  {t(lang, "nav.roadmap")}
                </p>
                <p className="text-white text-sm font-medium mb-2">
                  {lang === "fr" ? "Pas encore de feuille de route" : "No roadmap yet"}
                </p>
                <p className="text-[#888780] text-xs">
                  {lang === "fr" ? "Générez votre feuille de route personnalisée" : "Generate your personalized career roadmap"}
                </p>
                <p className="text-[#7F77DD] text-xs mt-4">{t(lang, "dashboard.generateNow")}</p>
              </div>
            </Link>
          )}

          {roadmap ? (
            <Link href="/roadmap" className="block">
              <div className="border border-[#2C2C2A] bg-[#0f1117] rounded-xl p-5 hover:border-[#444441] transition h-full">
                <p className="text-[#444441] text-[10px] font-medium tracking-widest uppercase mb-3">
                  {t(lang, "dashboard.skillGaps")}
                </p>
                <p className="text-white text-base font-medium mb-1">
                  {interpolate(t(lang, "dashboard.gapsIdentified"), { count: skillGapCount })}
                </p>
                <p className="text-[#888780] text-xs mb-4">
                  {t(lang, "dashboard.closeGaps")}
                </p>
                <div className="h-1 bg-[#2C2C2A] rounded-full mb-3">
                  <div
                    className="h-1 bg-[#7F77DD] rounded-full"
                    style={{ width: `${Math.max(10, 100 - skillGapCount * 20)}%` }}
                  />
                </div>
                <span className="text-[#7F77DD] text-xs">
                  {lang === "fr" ? "Voir quoi apprendre" : "See what to learn"}
                </span>
              </div>
            </Link>
          ) : (
            <div className="border border-[#2C2C2A] bg-[#0f1117] rounded-xl p-5 h-full">
              <p className="text-[#444441] text-[10px] font-medium tracking-widest uppercase mb-3">
                {t(lang, "dashboard.skillGaps")}
              </p>
              <p className="text-[#888780] text-xs">
                {lang === "fr" ? "Générez votre feuille de route pour voir vos lacunes" : "Generate your roadmap to see your skill gaps"}
              </p>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="mb-4">
          <p className="text-[#444441] text-[10px] font-medium tracking-widest uppercase mb-3">
            {t(lang, "dashboard.quickLinks")}
          </p>
          <div className="grid grid-cols-4 gap-3">
            {[
              {
                label: t(lang, "dashboard.myRoadmap"),
                href: "/roadmap",
                icon: <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeWidth="1.5"/>
              },
              {
                label: t(lang, "dashboard.opportunities"),
                href: "/opportunities",
                icon: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="1.5"/>
              },
              {
                label: t(lang, "dashboard.saved"),
                href: "/saved",
                icon: <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeWidth="1.5"/>
              },
              {
                label: t(lang, "dashboard.aiMentor"),
                href: "/mentor",
                icon: <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth="1.5"/>
              },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="border border-[#2C2C2A] bg-[#0f1117] rounded-xl p-4 flex flex-col items-center gap-2 hover:border-[#444441] transition">
                  <div className="w-8 h-8 bg-[#1a1830] rounded-lg flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeLinecap="round" strokeLinejoin="round">
                      {item.icon}
                    </svg>
                  </div>
                  <span className="text-[11px] text-[#888780] text-center">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick win */}
        {quickWin && (
          <div className="border border-[#2C2C2A] bg-[#0f1117] rounded-xl p-5 mb-4">
            <p className="text-[#444441] text-[10px] font-medium tracking-widest uppercase mb-2">
              {t(lang, "dashboard.quickWin")}
            </p>
            <p className="text-[#B4B2A9] text-sm leading-relaxed">{quickWin}</p>
          </div>
        )}

        {/* Mobile nav */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-[#2C2C2A] bg-[#080a0f] px-6 py-3 flex items-center justify-around md:hidden z-10">
          {[
            { label: t(lang, "nav.home"), href: "/dashboard", icon: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" strokeWidth="1.5"/> },
            { label: t(lang, "nav.roadmap"), href: "/roadmap", icon: <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeWidth="1.5"/> },
            { label: t(lang, "nav.explore"), href: "/opportunities", icon: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="1.5"/> },
            { label: t(lang, "nav.saved"), href: "/saved", icon: <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeWidth="1.5"/> },
            { label: t(lang, "nav.mentor"), href: "/mentor", icon: <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth="1.5"/> },
          ].map((item) => {
            const isActive = item.href === "/dashboard";
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

        <div className="h-20 md:hidden" />

      </div>
    </div>
  );
}
