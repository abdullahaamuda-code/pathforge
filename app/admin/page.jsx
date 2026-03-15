"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";

const tabs = ["Overview", "Users", "Opportunities", "Email", "AI Advisor"];

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  // Email state
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailTarget, setEmailTarget] = useState("all");
  const [sendingEmail, setSendingEmail] = useState(false);

  // AI advisor state
  const [aiMessages, setAiMessages] = useState([{
    role: "assistant",
    content: "Hey — I'm your PathForge admin AI. Ask me anything about your platform data, growth, or what to do next."
  }]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiBottomRef = useRef(null);

  useEffect(() => {
    if (activeTab === "Overview") loadAnalytics();
    if (activeTab === "Users") loadUsers();
    if (activeTab === "Opportunities") loadOpportunities();
  }, [activeTab]);

  useEffect(() => {
    aiBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      const data = await res.json();
      setAnalytics(data);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } finally {
      setLoading(false);
    }
  }

  async function loadOpportunities() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/opportunities");
      const data = await res.json();
      setOpportunities(data.opportunities || []);
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(uid) {
    if (!confirm("Delete this user and all their data?")) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid }),
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
      setActionMsg("User deleted");
      setTimeout(() => setActionMsg(""), 3000);
    }
  }

  async function deleteOpportunity(id) {
    if (!confirm("Delete this opportunity?")) return;
    const res = await fetch("/api/admin/opportunities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
      setActionMsg("Opportunity deleted");
      setTimeout(() => setActionMsg(""), 3000);
    }
  }

  async function toggleOpportunity(id, current) {
    const res = await fetch("/api/admin/opportunities", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, data: { isActive: !current } }),
    });
    if (res.ok) {
      setOpportunities((prev) =>
        prev.map((o) => o.id === id ? { ...o, isActive: !current } : o)
      );
    }
  }

  async function triggerScraper() {
    setActionMsg("Triggering scraper...");
    const res = await fetch("/api/admin/trigger-scraper", { method: "POST" });
    const data = await res.json();
    setActionMsg(data.success ? "Scraper triggered! Check GitHub Actions." : `Error: ${data.error}`);
    setTimeout(() => setActionMsg(""), 5000);
  }

  async function sendEmail() {
    if (!emailSubject || !emailMessage) return;
    setSendingEmail(true);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
          targetAll: emailTarget === "all",
          targetStage: emailTarget !== "all" ? emailTarget : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(`Email sent to ${data.sent} users`);
        setEmailSubject("");
        setEmailMessage("");
      } else {
        setActionMsg(`Error: ${data.error}`);
      }
    } finally {
      setSendingEmail(false);
      setTimeout(() => setActionMsg(""), 5000);
    }
  }

  async function sendAiMessage() {
    const message = aiInput.trim();
    if (!message || aiLoading) return;
    setAiInput("");

    const updated = [...aiMessages, { role: "user", content: message }];
    setAiMessages(updated);
    setAiLoading(true);

    try {
      const res = await fetch("/api/admin/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: aiMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setAiMessages([...updated, { role: "assistant", content: data.reply }]);
    } catch {
      setAiMessages([...updated, { role: "assistant", content: "Error getting response." }]);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSignOut() {
    document.cookie = "__session=; path=/; max-age=0";
    await signOut(auth);
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-[#080a0f] text-white">

      {/* Nav */}
      <div className="border-b border-[#2C2C2A] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#7F77DD] rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M4 14 L9 4 L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 10.5 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white font-medium text-sm">PathForge</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1830] text-[#7F77DD] border border-[#7F77DD]/20">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-[#888780] text-xs hover:text-white transition">
            App
          </Link>
          <button onClick={handleSignOut} className="text-[#444441] text-xs hover:text-[#888780] transition">
            Sign out
          </button>
        </div>
      </div>

      {/* Action message */}
      {actionMsg && (
        <div className="mx-6 mt-4 bg-[#1a1830] border border-[#7F77DD]/30 text-[#7F77DD] text-xs px-4 py-3 rounded-lg">
          {actionMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="px-6 mt-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeTab === tab
                ? "bg-[#534AB7] text-white"
                : "border border-[#2C2C2A] text-[#888780] hover:border-[#444441]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* OVERVIEW TAB */}
        {activeTab === "Overview" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-medium">Platform overview</h1>
              <button
                onClick={triggerScraper}
                className="flex items-center gap-2 bg-[#0f1117] border border-[#2C2C2A] hover:border-[#7F77DD]/40 text-[#7F77DD] text-xs px-4 py-2 rounded-lg transition"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Trigger scraper
              </button>
            </div>

            {loading ? (
              <p className="text-[#888780] text-sm">Loading...</p>
            ) : analytics ? (
              <div>
                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Total users", value: analytics.totalUsers },
                    { label: "Roadmaps generated", value: analytics.totalRoadmaps },
                    { label: "Opportunities", value: analytics.totalOpportunities },
                    { label: "Saved items", value: analytics.totalSaved },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-4">
                      <p className="text-[#888780] text-[10px] uppercase tracking-wider mb-2">{stat.label}</p>
                      <p className="text-white text-2xl font-medium">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Onboarding rate */}
                <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-5 mb-6">
                  <p className="text-[#888780] text-xs mb-2">Onboarding completion rate</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-[#2C2C2A] rounded-full">
                      <div
                        className="h-2 bg-[#7F77DD] rounded-full"
                        style={{ width: `${analytics.onboardingRate}%` }}
                      />
                    </div>
                    <span className="text-white text-sm font-medium">{analytics.onboardingRate}%</span>
                  </div>
                </div>

                {/* Breakdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-5">
                    <p className="text-[#7F77DD] text-[10px] uppercase tracking-wider mb-4">Users by stage</p>
                    {Object.entries(analytics.stageBreakdown).map(([stage, count]) => (
                      <div key={stage} className="flex items-center justify-between mb-3">
                        <span className="text-[#888780] text-xs capitalize">{stage}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-[#2C2C2A] rounded-full">
                            <div
                              className="h-1.5 bg-[#7F77DD] rounded-full"
                              style={{ width: `${analytics.totalUsers > 0 ? (count / analytics.totalUsers) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-white text-xs w-4">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-5">
                    <p className="text-[#7F77DD] text-[10px] uppercase tracking-wider mb-4">Users by country</p>
                    {Object.entries(analytics.countryBreakdown)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([country, count]) => (
                        <div key={country} className="flex items-center justify-between mb-3">
                          <span className="text-[#888780] text-xs">{country}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 bg-[#2C2C2A] rounded-full">
                              <div
                                className="h-1.5 bg-[#7F77DD] rounded-full"
                                style={{ width: `${analytics.totalUsers > 0 ? (count / analytics.totalUsers) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-white text-xs w-4">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Signups per day */}
                <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-5">
                  <p className="text-[#7F77DD] text-[10px] uppercase tracking-wider mb-4">Signups last 7 days</p>
                  <div className="flex items-end gap-2 h-20">
                    {Object.entries(analytics.signupsPerDay).map(([date, count]) => {
                      const max = Math.max(...Object.values(analytics.signupsPerDay), 1);
                      return (
                        <div key={date} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[#7F77DD] text-[10px]">{count > 0 ? count : ""}</span>
                          <div
                            className="w-full bg-[#7F77DD]/30 rounded-sm"
                            style={{ height: `${Math.max(4, (count / max) * 60)}px` }}
                          />
                          <span className="text-[#444441] text-[9px]">
                            {new Date(date).toLocaleDateString("en", { weekday: "short" })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "Users" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-medium">Users ({users.length})</h1>
              <button onClick={loadUsers} className="text-[#7F77DD] text-xs hover:text-[#AFA9EC] transition">
                Refresh
              </button>
            </div>
            {loading ? (
              <p className="text-[#888780] text-sm">Loading...</p>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.uid} className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{u.name || "No name"}</p>
                      <p className="text-[#888780] text-xs">{u.email}</p>
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        {u.stage && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1830] text-[#7F77DD] border border-[#7F77DD]/20">
                            {u.stage}
                          </span>
                        )}
                        {u.country && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1c23] text-[#888780] border border-[#2C2C2A]">
                            {u.country}
                          </span>
                        )}
                        {u.onboardingComplete && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-900/20 text-green-400 border border-green-800/30">
                            Onboarded
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[#444441] text-[10px] mb-2">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ""}
                      </p>
                      <button
                        onClick={() => deleteUser(u.uid)}
                        className="text-red-400 text-[10px] hover:text-red-300 transition border border-red-800/30 px-2 py-1 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OPPORTUNITIES TAB */}
        {activeTab === "Opportunities" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-medium">Opportunities ({opportunities.length})</h1>
              <div className="flex gap-3">
                <button
                  onClick={triggerScraper}
                  className="text-[#7F77DD] text-xs border border-[#2C2C2A] px-4 py-2 rounded-lg hover:border-[#7F77DD]/40 transition"
                >
                  Run scraper
                </button>
                <button onClick={loadOpportunities} className="text-[#7F77DD] text-xs hover:text-[#AFA9EC] transition">
                  Refresh
                </button>
              </div>
            </div>
            {loading ? (
              <p className="text-[#888780] text-sm">Loading...</p>
            ) : (
              <div className="space-y-3">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          opp.type === "job" ? "bg-[#1a1830] text-[#7F77DD] border-[#7F77DD]/20" :
                          opp.type === "grant" ? "bg-green-900/20 text-green-400 border-green-800/30" :
                          opp.type === "course" ? "bg-orange-900/20 text-orange-400 border-orange-800/30" :
                          "bg-purple-900/20 text-purple-400 border-purple-800/30"
                        }`}>
                          {opp.type}
                        </span>
                        {!opp.isActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-900/20 text-red-400 border border-red-800/30">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-white text-sm font-medium leading-snug">{opp.title}</p>
                      <p className="text-[#888780] text-xs">{opp.provider} · {opp.source}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleOpportunity(opp.id, opp.isActive)}
                        className={`text-[10px] px-3 py-1.5 rounded-lg border transition ${
                          opp.isActive
                            ? "border-[#2C2C2A] text-[#888780] hover:border-[#444441]"
                            : "border-green-800/30 text-green-400 hover:border-green-700"
                        }`}
                      >
                        {opp.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => deleteOpportunity(opp.id)}
                        className="text-red-400 text-[10px] border border-red-800/30 px-3 py-1.5 rounded-lg hover:text-red-300 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EMAIL TAB */}
        {activeTab === "Email" && (
          <div className="max-w-2xl">
            <h1 className="text-xl font-medium mb-6">Send email to users</h1>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#888780] tracking-wider uppercase mb-1.5">
                  Target audience
                </label>
                <select
                  value={emailTarget}
                  onChange={(e) => setEmailTarget(e.target.value)}
                  className="w-full bg-[#0f1117] border border-[#2C2C2A] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7F77DD] transition"
                >
                  <option value="all">All users</option>
                  <option value="secondary">Secondary school students</option>
                  <option value="applicant">University applicants</option>
                  <option value="undergraduate">Undergraduates</option>
                  <option value="graduate">Graduates</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#888780] tracking-wider uppercase mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject line"
                  className="w-full bg-[#0f1117] border border-[#2C2C2A] rounded-lg px-4 py-3 text-sm text-white placeholder-[#444441] focus:outline-none focus:border-[#7F77DD] transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#888780] tracking-wider uppercase mb-1.5">
                  Message
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Write your message here..."
                  rows={8}
                  className="w-full bg-[#0f1117] border border-[#2C2C2A] rounded-lg px-4 py-3 text-sm text-white placeholder-[#444441] focus:outline-none focus:border-[#7F77DD] transition resize-none"
                />
              </div>
              <button
                onClick={sendEmail}
                disabled={sendingEmail || !emailSubject || !emailMessage}
                className="bg-[#534AB7] hover:bg-[#4840a0] text-white rounded-lg px-6 py-3 text-sm font-medium transition disabled:opacity-50"
              >
                {sendingEmail ? "Sending..." : "Send email"}
              </button>
            </div>
          </div>
        )}

        {/* AI ADVISOR TAB */}
        {activeTab === "AI Advisor" && (
          <div className="max-w-3xl">
            <h1 className="text-xl font-medium mb-6">Admin AI advisor</h1>
            <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-4 h-96 overflow-y-auto mb-4 space-y-4">
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 bg-[#7F77DD] rounded-lg flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                      <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                        <path d="M4 14 L9 4 L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 10.5 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#534AB7] text-white rounded-tr-sm"
                      : "bg-[#1a1c23] border border-[#2C2C2A] text-[#B4B2A9] rounded-tl-sm"
                  }`}>
                    {msg.content.split("\n").map((line, j) => (
                      <span key={j}>{line}{j < msg.content.split("\n").length - 1 && <br />}</span>
                    ))}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 bg-[#7F77DD] rounded-lg flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                    <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                      <path d="M4 14 L9 4 L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 10.5 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="bg-[#1a1c23] border border-[#2C2C2A] rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center h-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7F77DD] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7F77DD] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7F77DD] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={aiBottomRef} />
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendAiMessage()}
                placeholder="Ask about your platform data..."
                className="flex-1 bg-[#0f1117] border border-[#2C2C2A] rounded-xl px-4 py-3 text-sm text-white placeholder-[#444441] focus:outline-none focus:border-[#7F77DD] transition"
              />
              <button
                onClick={sendAiMessage}
                disabled={aiLoading || !aiInput.trim()}
                className="w-10 h-10 bg-[#534AB7] hover:bg-[#4840a0] rounded-xl flex items-center justify-center transition disabled:opacity-40"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
```

Add all the new env variables to Vercel and `.env.local`:
```
NEXT_PUBLIC_ADMIN_EMAIL=youremail@gmail.com
GITHUB_TOKEN=your_github_pat
GITHUB_REPO_OWNER=your_github_username
GITHUB_REPO_NAME=pathforge
