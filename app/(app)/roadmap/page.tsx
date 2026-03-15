"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUser, getRoadmap } from "@/lib/firestore";
import Link from "next/link";
import { t } from "@/lib/i18n";

export default function RoadmapPage() {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activePath, setActivePath] = useState(0);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (user) loadRoadmap();
  }, [user]);

  async function loadRoadmap() {
    try {
      const userData = await getUser(user.uid);
      setLang(userData?.language || "en");
      const existing = await getRoadmap(user.uid);
      if (existing) {
        setRoadmap(existing);
      } else {
        await generateRoadmap(userData);
      }
    } catch (err) {
      setError(lang === "fr" ? "Échec du chargement de la feuille de route" : "Failed to load roadmap");
    } finally {
      setLoading(false);
    }
  }

  async function generateRoadmap(userDataOverride?: any) {
    setGenerating(true);
    setError("");
    try {
      const userData = userDataOverride || await getUser(user.uid);
      const res = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, user: userData }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRoadmap(data.roadmap);
    } catch (err) {
      setError(lang === "fr" ? "Échec de la génération. Réessayez." : "Failed to generate roadmap. Please try again.");
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  }

  async function downloadPDF() {
    setDownloading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = 20;

      const addText = (text, fontSize, color, isBold, maxWidth) => {
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color[0], color[1], color[2]);
        if (isBold) pdf.setFont("helvetica", "bold");
        else pdf.setFont("helvetica", "normal");
        const lines = pdf.splitTextToSize(text || "", maxWidth || contentWidth);
        lines.forEach((line) => {
          if (y > 270) { pdf.addPage(); y = 20; }
          pdf.text(line, margin, y);
          y += fontSize * 0.45;
        });
        y += 2;
      };

      const addDivider = () => {
        if (y > 270) { pdf.addPage(); y = 20; }
        pdf.setDrawColor(44, 44, 42);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 6;
      };

      pdf.setFillColor(15, 17, 23);
      pdf.rect(0, 0, pageWidth, 30, "F");
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.text("PathForge", margin, 18);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(127, 119, 221);
      pdf.text(lang === "fr" ? "Votre Feuille de Route" : "Your Career Roadmap", margin + 42, 18);
      y = 42;

      addText(lang === "fr" ? "VOS CORRESPONDANCES DE CARRIÈRE" : "YOUR CAREER MATCHES", 8, [127, 119, 221], true, contentWidth);
      addText(lang === "fr" ? "Meilleures voies de carrière pour vous" : "Best career paths for you", 16, [255, 255, 255], true, contentWidth);
      y += 4;

      roadmap.careerPaths?.forEach((path) => {
        if (y > 250) { pdf.addPage(); y = 20; }
        pdf.setFillColor(26, 24, 48);
        pdf.roundedRect(margin, y, contentWidth, 28, 3, 3, "F");
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(255, 255, 255);
        pdf.text(path.title, margin + 4, y + 9);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(127, 119, 221);
        pdf.text(`${path.matchScore}% ${t(lang, "roadmap.match")}`, pageWidth - margin - 20, y + 9);
        pdf.setFontSize(8);
        pdf.setTextColor(136, 135, 128);
        const fitLines = pdf.splitTextToSize(path.whyItFits || "", contentWidth - 8);
        pdf.text(fitLines[0] || "", margin + 4, y + 17);
        pdf.setTextColor(180, 178, 169);
        pdf.text(`${path.growthOutlook} · ${path.timeToEntry}`, margin + 4, y + 24);
        y += 34;
      });

      y += 4;
      addDivider();

      addText(lang === "fr" ? "VOTRE FEUILLE DE ROUTE" : "YOUR ROADMAP", 8, [127, 119, 221], true, contentWidth);
      addText(roadmap.roadmap?.title || "", 16, [255, 255, 255], true, contentWidth);
      addText(`${t(lang, "roadmap.totalDuration")}: ${roadmap.roadmap?.totalDuration}`, 9, [136, 135, 128], false, contentWidth);
      y += 4;

      roadmap.roadmap?.steps?.forEach((step, i) => {
        if (y > 240) { pdf.addPage(); y = 20; }
        pdf.setFillColor(15, 17, 23);
        pdf.setDrawColor(44, 44, 42);
        pdf.roundedRect(margin, y, contentWidth, 8, 2, 2, "FD");
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(255, 255, 255);
        pdf.text(`${i + 1}. ${step.phase}`, margin + 4, y + 5.5);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(127, 119, 221);
        pdf.text(step.duration, pageWidth - margin - 25, y + 5.5);
        y += 12;

        step.actions?.forEach((action) => {
          if (y > 270) { pdf.addPage(); y = 20; }
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(180, 178, 169);
          pdf.text("→", margin + 2, y);
          const actionLines = pdf.splitTextToSize(action, contentWidth - 10);
          actionLines.forEach((line) => {
            if (y > 270) { pdf.addPage(); y = 20; }
            pdf.text(line, margin + 8, y);
            y += 4.5;
          });
          y += 1;
        });

        if (y > 270) { pdf.addPage(); y = 20; }
        pdf.setFontSize(8);
        pdf.setTextColor(127, 119, 221);
        pdf.text(`${t(lang, "roadmap.milestone")}: `, margin + 2, y);
        pdf.setTextColor(136, 135, 128);
        const milestoneLines = pdf.splitTextToSize(step.milestone || "", contentWidth - 22);
        pdf.text(milestoneLines[0] || "", margin + 22, y);
        y += 10;
      });

      addDivider();

      addText(lang === "fr" ? "LACUNES DE COMPÉTENCES" : "SKILL GAPS", 8, [127, 119, 221], true, contentWidth);
      addText(t(lang, "roadmap.stillNeedToLearn"), 16, [255, 255, 255], true, contentWidth);
      y += 4;

      roadmap.skillGaps?.forEach((gap) => {
        if (y > 255) { pdf.addPage(); y = 20; }
        const importanceColor =
          gap.importance === "Critical" ? [228, 75, 74] :
          gap.importance === "Important" ? [186, 117, 23] :
          [99, 153, 34];
        pdf.setFillColor(15, 17, 23);
        pdf.setDrawColor(44, 44, 42);
        pdf.roundedRect(margin, y, contentWidth, 18, 2, 2, "FD");
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(255, 255, 255);
        pdf.text(gap.skill, margin + 4, y + 6);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(importanceColor[0], importanceColor[1], importanceColor[2]);
        pdf.text(gap.importance, pageWidth - margin - 30, y + 6);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(136, 135, 128);
        const learnLines = pdf.splitTextToSize(gap.howToLearn || "", contentWidth - 8);
        pdf.text(learnLines[0] || "", margin + 4, y + 13);
        y += 23;
      });

      addDivider();

      addText(lang === "fr" ? "VICTOIRES RAPIDES" : "QUICK WINS", 8, [127, 119, 221], true, contentWidth);
      addText(t(lang, "roadmap.startThisWeek"), 16, [255, 255, 255], true, contentWidth);
      y += 4;

      roadmap.quickWins?.forEach((win, i) => {
        if (y > 265) { pdf.addPage(); y = 20; }
        pdf.setFillColor(15, 17, 23);
        pdf.setDrawColor(44, 44, 42);
        const winLines = pdf.splitTextToSize(win, contentWidth - 14);
        const boxH = Math.max(12, winLines.length * 5 + 6);
        pdf.roundedRect(margin, y, contentWidth, boxH, 2, 2, "FD");
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(127, 119, 221);
        pdf.text(`${i + 1}`, margin + 4, y + boxH / 2 + 1);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(180, 178, 169);
        winLines.forEach((line, li) => {
          pdf.text(line, margin + 10, y + 5 + li * 5);
        });
        y += boxH + 4;
      });

      if (roadmap.motivationalNote) {
        if (y > 240) { pdf.addPage(); y = 20; }
        addDivider();
        addText(lang === "fr" ? "UNE NOTE POUR VOUS" : "A NOTE FOR YOU", 8, [127, 119, 221], true, contentWidth);
        y += 2;
        pdf.setFillColor(26, 24, 48);
        const noteLines = pdf.splitTextToSize(roadmap.motivationalNote, contentWidth - 8);
        const noteH = noteLines.length * 5 + 10;
        pdf.roundedRect(margin, y, contentWidth, noteH, 3, 3, "F");
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(180, 178, 169);
        noteLines.forEach((line, i) => {
          pdf.text(line, margin + 4, y + 7 + i * 5);
        });
        y += noteH + 6;
      }

      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(7);
        pdf.setTextColor(68, 68, 65);
        pdf.text("Generated by PathForge · pathforge.app", margin, 290);
        pdf.text(`${i} / ${pageCount}`, pageWidth - margin, 290, { align: "right" });
      }

      pdf.save("my-pathforge-roadmap.pdf");
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setDownloading(false);
    }
  }

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 bg-[#7F77DD] rounded-lg flex items-center justify-center animate-pulse">
<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5" opacity="0.5"/>
  <polygon points="12,5 14.5,11.5 12,10 9.5,11.5" fill="white"/>
  <circle cx="12" cy="18" r="1.5" fill="white" opacity="0.5"/>
  <line x1="5" y1="12" x2="7" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  <line x1="17" y1="12" x2="19" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
</svg>
        </div>
        <p className="text-[#888780] text-sm">
          {generating ? t(lang, "roadmap.building") : (lang === "fr" ? "Chargement..." : "Loading...")}
        </p>
        {generating && (
          <p className="text-[#444441] text-xs max-w-xs text-center">
            {t(lang, "roadmap.analyzing")}
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={() => generateRoadmap()}
          className="bg-[#534AB7] text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-[#4840a0] transition"
        >
          {lang === "fr" ? "Réessayer" : "Try again"}
        </button>
      </div>
    );
  }

  if (!roadmap) return null;

  const importanceColors = {
    "Critical": "text-red-400",
    "Important": "text-yellow-400",
    "Nice to have": "text-green-400",
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-white">

      {/* Nav */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#080a0f] z-10">
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
          <Link href="/roadmap" className="text-white text-xs font-medium">{t(lang, "nav.roadmap")}</Link>
          <Link href="/opportunities" className="text-[#888780] text-xs hover:text-white transition">{t(lang, "dashboard.opportunities")}</Link>
          <Link href="/saved" className="text-[#888780] text-xs hover:text-white transition">{t(lang, "dashboard.saved")}</Link>
          <Link href="/mentor" className="text-[#888780] text-xs hover:text-white transition">{t(lang, "dashboard.aiMentor")}</Link>
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[#444441] text-xs mb-1">{t(lang, "roadmap.personalized")}</p>
            <h1 className="text-white text-xl font-medium">{t(lang, "roadmap.herePath")}</h1>
          </div>
          <button
            onClick={() => generateRoadmap()}
            disabled={generating}
            title={t(lang, "roadmap.regenerate")}
            className="w-9 h-9 rounded-full border border-[#2C2C2A] bg-[#0f1117] hover:border-[#7F77DD] hover:bg-[#1a1830] flex items-center justify-center transition disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={generating ? "animate-spin" : ""}>
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Career paths */}
        <div className="mb-10">
          <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-6">
            {t(lang, "roadmap.yourCareerMatches")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roadmap.careerPaths?.map((path, i) => (
              <button
                key={i}
                onClick={() => setActivePath(i)}
                className={`text-left rounded-xl border p-5 transition-all ${
                  activePath === i
                    ? "border-[#7F77DD] bg-[#1a1830]"
                    : "border-[#2C2C2A] bg-[#0f1117] hover:border-[#444441]"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-medium text-white">{path.title}</span>
                  <span className="text-[#7F77DD] text-xs font-medium ml-2">{path.matchScore}%</span>
                </div>
                <p className="text-[#888780] text-xs leading-relaxed mb-3">{path.whyItFits}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1c23] text-[#B4B2A9]">
                    {path.growthOutlook} {t(lang, "roadmap.growth").toLowerCase()}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1c23] text-[#B4B2A9]">
                    {path.timeToEntry}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected path detail */}
        {roadmap.careerPaths?.[activePath] && (
          <div className="mb-10 border border-[#2C2C2A] rounded-xl p-5 bg-[#0f1117]">
            <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-3">
              {t(lang, "roadmap.aboutThisPath")}
            </p>
            <p className="text-[#B4B2A9] text-sm leading-relaxed mb-4">
              {roadmap.careerPaths[activePath].description}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-[#1a1c23] rounded-lg p-3">
                <p className="text-[#888780] text-[10px] uppercase tracking-wider mb-1">{t(lang, "roadmap.avgSalary")}</p>
                <p className="text-white text-xs font-medium">{roadmap.careerPaths[activePath].averageSalary}</p>
              </div>
              <div className="bg-[#1a1c23] rounded-lg p-3">
                <p className="text-[#888780] text-[10px] uppercase tracking-wider mb-1">{t(lang, "roadmap.growth")}</p>
                <p className="text-white text-xs font-medium">{roadmap.careerPaths[activePath].growthOutlook}</p>
              </div>
              <div className="bg-[#1a1c23] rounded-lg p-3">
                <p className="text-[#888780] text-[10px] uppercase tracking-wider mb-1">{t(lang, "roadmap.timeToEntry")}</p>
                <p className="text-white text-xs font-medium">{roadmap.careerPaths[activePath].timeToEntry}</p>
              </div>
            </div>
          </div>
        )}

        {/* Roadmap steps */}
        <div className="mb-10">
          <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-2">
            {t(lang, "roadmap.yourRoadmap")}
          </p>
          <h2 className="text-xl font-medium mb-2">{roadmap.roadmap?.title}</h2>
          <p className="text-[#888780] text-sm mb-6">
            {t(lang, "roadmap.totalDuration")}: {roadmap.roadmap?.totalDuration}
          </p>
          <div className="space-y-4">
            {roadmap.roadmap?.steps?.map((step, i) => (
              <div key={i} className="border border-[#2C2C2A] rounded-xl p-5 bg-[#0f1117]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 rounded-full bg-[#7F77DD]/20 flex items-center justify-center text-[#7F77DD] text-xs font-medium flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{step.phase}</p>
                    <p className="text-[11px] text-[#888780]">{step.duration}</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-3">
                  {step.actions?.map((action, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-[#B4B2A9]">
                      <span className="text-[#7F77DD] mt-0.5 flex-shrink-0">→</span>
                      {action}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-[#2C2C2A] pt-3 mt-3">
                  <p className="text-[11px] text-[#888780]">
                    <span className="text-[#7F77DD]">{t(lang, "roadmap.milestone")}: </span>
                    {step.milestone}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill gaps */}
        <div className="mb-10">
          <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-2">
            {t(lang, "roadmap.skillGaps")}
          </p>
          <h2 className="text-xl font-medium mb-6">{t(lang, "roadmap.stillNeedToLearn")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roadmap.skillGaps?.map((gap, i) => (
              <div key={i} className="border border-[#2C2C2A] rounded-xl p-4 bg-[#0f1117]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white">{gap.skill}</p>
                  <span className={`text-[11px] font-medium ${importanceColors[gap.importance] || "text-gray-400"}`}>
                    {gap.importance}
                  </span>
                </div>
                <p className="text-xs text-[#888780]">{gap.howToLearn}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick wins */}
        <div className="mb-10">
          <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-2">
            {t(lang, "roadmap.quickWins")}
          </p>
          <h2 className="text-xl font-medium mb-4">{t(lang, "roadmap.startThisWeek")}</h2>
          <div className="space-y-3">
            {roadmap.quickWins?.map((win, i) => (
              <div key={i} className="flex items-start gap-3 border border-[#2C2C2A] rounded-xl p-4 bg-[#0f1117]">
                <div className="w-5 h-5 rounded-full bg-[#7F77DD]/20 flex items-center justify-center text-[#7F77DD] text-[10px] font-medium flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-[#B4B2A9]">{win}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational note */}
        {roadmap.motivationalNote && (
          <div className="border border-[#7F77DD]/30 rounded-xl p-6 bg-[#1a1830] mb-10">
            <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-3">
              {t(lang, "roadmap.noteForYou")}
            </p>
            <p className="text-[#B4B2A9] text-sm leading-relaxed">{roadmap.motivationalNote}</p>
          </div>
        )}

        {/* Download button */}
        <div className="flex justify-center pb-24 md:pb-10">
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 bg-[#534AB7] hover:bg-[#4840a0] text-white px-8 py-3 rounded-xl text-sm font-medium transition disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v13m0 0l-4-4m4 4l4-4M3 21h18"
                stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {downloading ? t(lang, "roadmap.generatingPDF") : t(lang, "roadmap.downloadPDF")}
          </button>
        </div>

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
          const isActive = item.href === "/roadmap";
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
