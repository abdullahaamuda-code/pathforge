"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getSaved, getUser } from "@/lib/firestore";
import { db } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { t } from "@/lib/i18n";

const typeColors = {
  job: "bg-[#1a1830] text-[#7F77DD] border border-[#7F77DD]/20",
  grant: "bg-green-900/20 text-green-400 border border-green-800/30",
  course: "bg-orange-900/20 text-orange-400 border border-orange-800/30",
  fellowship: "bg-purple-900/20 text-purple-400 border border-purple-800/30",
};

export default function SavedPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState([]);
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (user) loadSaved();
  }, [user]);

  async function loadSaved() {
    try {
      const [data, userData] = await Promise.all([
        getSaved(user.uid),
        getUser(user.uid),
      ]);
      setSaved(data);
      setLang(userData?.language || "en");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(docId) {
    setRemovingId(docId);
    try {
      await deleteDoc(doc(db, "saved", docId));
      setSaved((prev) => prev.filter((s) => s.id !== docId));
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingId(null);
    }
  }

  const getDaysUntil = (deadline) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const deadlineLabel = (daysLeft) => {
    if (daysLeft <= 0) return lang === "fr" ? "Date limite passée" : "Deadline passed";
    if (daysLeft === 1) return lang === "fr" ? "1 jour restant" : "1 day left";
    return lang === "fr" ? `${daysLeft} jours restants` : `${daysLeft} days left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center">
        <div className="w-7 h-7 bg-[#7F77DD] rounded-lg animate-pulse flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path d="M4 14 L9 4 L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 10.5 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
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
          <Link href="/roadmap" className="text-[#888780] text-xs hover:text-white transition">{t(lang, "nav.roadmap")}</Link>
          <Link href="/opportunities" className="text-[#888780] text-xs hover:text-white transition">{t(lang, "dashboard.opportunities")}</Link>
          <Link href="/saved" className="text-white text-xs font-medium">{t(lang, "dashboard.saved")}</Link>
          <Link href="/mentor" className="text-[#888780] text-xs hover:text-white transition">{t(lang, "dashboard.aiMentor")}</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#888780] text-xs mb-1">
            {lang === "fr" ? "Vos favoris" : "Your bookmarks"}
          </p>
          <h1 className="text-white text-xl font-medium">
            {lang === "fr" ? "Opportunités sauvegardées" : "Saved opportunities"}
          </h1>
        </div>

        {saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 bg-[#0f1117] border border-[#2C2C2A] rounded-2xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  stroke="#444441" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-[#888780] text-sm">
              {lang === "fr" ? "Rien de sauvegardé pour l'instant" : "Nothing saved yet"}
            </p>
            <p className="text-[#444441] text-xs text-center max-w-xs">
              {lang === "fr"
                ? "Parcourez les opportunités et appuyez sur Sauvegarder pour suivre celles qui vous intéressent"
                : "Browse opportunities and tap Save on anything you want to track"
              }
            </p>
            <Link
              href="/opportunities"
              className="bg-[#534AB7] hover:bg-[#4840a0] text-white text-xs px-6 py-2.5 rounded-lg transition mt-2"
            >
              {lang === "fr" ? "Parcourir les opportunités" : "Browse opportunities"}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {saved.map((item) => {
              const daysLeft = getDaysUntil(item.deadline);
              return (
                <div
                  key={item.id}
                  className="border border-[#2C2C2A] bg-[#0f1117] rounded-xl p-5 hover:border-[#444441] transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[item.type] || typeColors.job}`}>
                          {item.type}
                        </span>
                        {daysLeft !== null && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            daysLeft <= 7
                              ? "bg-red-900/20 text-red-400 border-red-800/30"
                              : daysLeft <= 30
                              ? "bg-yellow-900/20 text-yellow-400 border-yellow-800/30"
                              : "bg-[#1a1c23] text-[#888780] border-[#2C2C2A]"
                          }`}>
                            {deadlineLabel(daysLeft)}
                          </span>
                        )}
                      </div>
                      <p className="text-white text-sm font-medium leading-snug mb-1">{item.title}</p>
                      <p className="text-[#888780] text-xs">{item.provider}</p>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={removingId === item.id}
                      className="text-[#444441] hover:text-red-400 transition flex-shrink-0 mt-1"
                      title={lang === "fr" ? "Retirer des sauvegardés" : "Remove from saved"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    {item.url && (
                      
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#534AB7] hover:bg-[#4840a0] text-white text-xs px-4 py-2 rounded-lg transition"
                      >
                        {t(lang, "opportunities.applyNow")}
                      </a>
                    )}
                    <span className="text-[#444441] text-xs">
                      {lang === "fr" ? "Sauvegardé" : "Saved"}{" "}
                      {item.savedAt?.toDate
                        ? new Date(item.savedAt.toDate()).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB")
                        : (lang === "fr" ? "récemment" : "recently")}
                    </span>
                  </div>
                </div>
              );
            })}
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
          const isActive = item.href === "/saved";
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
