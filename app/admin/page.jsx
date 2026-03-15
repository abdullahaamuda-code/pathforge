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
  const [actionType, setActionType] = useState("info");

  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailTarget, setEmailTarget] = useState("all");
  const [selectedUids, setSelectedUids] = useState([]);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState("");
  const [draftLoading, setDraftLoading] = useState(false);

  const [aiMessages, setAiMessages] = useState([{
    role: "assistant",
    content: "Hey — I'm your PathForge admin AI. Ask me anything about your platform data, growth, or what to do next. Say 'draft email about...' and I'll prepare it for you.",
  }]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiBottomRef = useRef(null);

  const [userSearch, setUserSearch] = useState("");
  const [oppFilter, setOppFilter] = useState("all");

  useEffect(() => {
    if (activeTab === "Overview") loadAnalytics();
    if (activeTab === "Users") loadUsers();
    if (activeTab === "Opportunities") loadOpportunities();
  }, [activeTab]);

  useEffect(() => {
    aiBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  function showMsg(msg, type = "info") {
    setActionMsg(msg);
    setActionType(type);
    setTimeout(() => setActionMsg(""), 6000);
  }

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
      showMsg("User deleted", "success");
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
      showMsg("Deleted", "success");
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
    showMsg("Triggering scraper...", "info");
    try {
      const res = await fetch("/api/admin/trigger-scraper", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        if (data.run?.url) {
          setActionMsg(`Scraper running! ${data.run.url}`);
          setActionType("success");
          setTimeout(() => setActionMsg(""), 10000);
        } else {
          showMsg("Scraper triggered successfully", "success");
        }
      } else {
        showMsg(`Error: ${data.error}`, "error");
      }
    } catch (err) {
      showMsg(`Failed: ${err.message}`, "error");
    }
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
          targetStage: emailTarget !== "all" && emailTarget !== "specific" ? emailTarget : null,
          targetUids: emailTarget === "specific" ? selectedUids : [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        showMsg(`Sent to ${data.sent} users`, "success");
        setEmailSubject("");
        setEmailMessage("");
        setSelectedUids([]);
      } else {
        showMsg(`Error: ${data.error}`, "error");
      }
    } finally {
      setSendingEmail(false);
    }
  }

  async function draftEmail() {
    if (!draftPrompt) return;
    setDraftLoading(true);
    try {
      const res = await fetch("/api/admin/draft-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: draftPrompt }),
      });
      const data = await res.json();
      if (data.subject) setEmailSubject(data.subject);
      if (data.message) setEmailMessage(data.message);
      setDraftPrompt("");
      setActiveTab("Email");
      showMsg("Email drafted — review and send", "success");
    } finally {
      setDraftLoading(false);
    }
  }

  async function sendAiMessage(textOverride) {
    const message = textOverride || aiInput.trim();
    if (!message || aiLoading) return;
    setAiInput("");

    const updated = [...aiMessages, { role: "user", content: message }];
    setAiMessages(updated);
    setAiLoading(true);

    const isDraftRequest = message.toLowerCase().includes("draft") && message.toLowerCase().includes("email");

    if (isDraftRequest) {
      try {
        const res = await fetch("/api/admin/draft-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: message }),
        });
        const data = await res.json();
        if (data.subject && data.message) {
          setAiMessages([...updated, {
            role: "assistant",
            content: `Here's a draft:\n\nSubject: ${data.subject}\n\n${data.message}`,
            draft: { subject: data.subject, message: data.message },
          }]);
        }
      } catch {
        setAiMessages([...updated, { role: "assistant", content: "Sorry, couldn't draft that." }]);
      } finally {
        setAiLoading(false);
      }
      return;
    }

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
      setAiMessages([...updated, { role: "assistant", content: "Error. Try again." }]);
    } finally {
      setAiLoading(false);
    }
  }

  function useDraft(draft) {
    setEmailSubject(draft.subject);
    setEmailMessage(draft.message);
    setActiveTab("Email");
  }

  async function handleSignOut() {
    document.cookie = "__session=; path=/; max-age=0";
    await signOut(auth);
    window.location.href = "/login";
  }

  const filteredUsers = users.filter((u) =>
    !userSearch ||
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredOpps = opportunities.filter((o) =>
    oppFilter === "all" || o.type === oppFilter
  );

  const msgColors = {
    info: "bg-[#1a1830] border-[#7F77DD]/30 text-[#7F77DD]",
    success: "bg-green-900/20 border-green-800/40 text-green-400",
    error: "bg-red-900/20 border-red-800/40 text-red-400",
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-white">

      {/* Nav */}
      <div className="border-b border-[#2C2C2A] px-4 py-3 flex items-center justify-between sticky top-0 bg-[#080a0f] z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#7F77DD] rounded-md flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
              <path d="M4 14 L9 4 L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 10.5 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white font-medium text-sm">PathForge</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1830] text-[#7F77DD] border border-[#7F77DD]/20">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-[#888780] text-xs hover:text-white transition">App</Link>
          <button onClick={handleSignOut} className="text-[#444441] text-xs hover:text-[#888780] transition">Sign out</button>
        </div>
      </div>

      {/* Action message */}
      {actionMsg && (
        <div className={`mx-4 mt-3 border text-xs px-3 py-2 rounded-lg ${msgColors[actionType]}`}>
          {actionMsg.includes("http") ? (
            <span>
              Scraper is running —{" "}
              
                href={actionMsg.split(" ").find((w) => w.startsWith("http"))}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                View on GitHub →
              </a>
            </span>
          ) : actionMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 px-4 pt-3 pb-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeTab === tab
                ? "bg-[#534AB7] text-white"
                : "border border-[#2C2C2A] text-[#888780] hover:border-[#444441]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 max-w-5xl mx-auto">

        {/* OVERVIEW */}
        {activeTab === "Overview" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-white text-sm font-medium">Overview</p>
              <button
                onClick={triggerScraper}
                className="flex items-center gap-1.5 bg-[#0f1117] border border-[#2C2C2A] hover:border-[#7F77DD]/40 text-[#7F77DD] text-xs px-3 py-1.5 rounded-lg transition"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Run scrapers
              </button>
            </div>

            {loading ? (
              <p className="text-[#888780] text-xs">Loading...</p>
            ) : analytics ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Total users", value: analytics.totalUsers },
                    { label: "Roadmaps", value: analytics.totalRoadmaps },
                    { label: "Opportunities", value: analytics.totalOpportunities },
                    { label: "Saved", value: analytics.totalSaved },
                  ].map((s) => (
                    <div key={s.label} className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-3">
                      <p className="text-[#444441] text-[10px] uppercase tracking-wider mb-1">{s.label}</p>
                      <p className="text-white text-xl font-medium">{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[#888780] text-xs">Onboarding completion</p>
                    <p className="text-white text-xs font-medium">{analytics.onboardingRate}%</p>
                  </div>
                  <div className="h-1.5 bg-[#2C2C2A] rounded-full">
                    <div className="h-1.5 bg-[#7F77DD] rounded-full" style={{ width: `${analytics.onboardingRate}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-4">
                    <p className="text-[#7F77DD] text-[10px] uppercase tracking-wider mb-3">By stage</p>
                    {Object.entries(analytics.stageBreakdown).map(([stage, count]) => (
                      <div key={stage} className="flex items-center gap-2 mb-2">
                        <span className="text-[#888780] text-xs w-20 capitalize">{stage}</span>
                        <div className="flex-1 h-1.5 bg-[#2C2C2A] rounded-full">
                          <div className="h-1.5 bg-[#7F77DD] rounded-full" style={{ width: `${analytics.totalUsers > 0 ? (count / analytics.totalUsers) * 100 : 0}%` }} />
                        </div>
                        <span className="text-white text-xs w-4">{count}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-4">
                    <p className="text-[#7F77DD] text-[10px] uppercase tracking-wider mb-3">By country</p>
                    {Object.entries(analytics.countryBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([country, count]) => (
                      <div key={country} className="flex items-center gap-2 mb-2">
                        <span className="text-[#888780] text-xs w-20 truncate">{country}</span>
                        <div className="flex-1 h-1.5 bg-[#2C2C2A] rounded-full">
                          <div className="h-1.5 bg-[#7F77DD] rounded-full" style={{ width: `${analytics.totalUsers > 0 ? (count / analytics.totalUsers) * 100 : 0}%` }} />
                        </div>
                        <span className="text-white text-xs w-4">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-4">
                  <p className="text-[#7F77DD] text-[10px] uppercase tracking-wider mb-3">Signups last 7 days</p>
                  <div className="flex items-end gap-1.5 h-16">
                    {Object.entries(analytics.signupsPerDay).map(([date, count]) => {
                      const max = Math.max(...Object.values(analytics.signupsPerDay), 1);
                      return (
                        <div key={date} className="flex-1 flex flex-col items-center gap-1">
                          {count > 0 && <span className="text-[#7F77DD] text-[9px]">{count}</span>}
                          <div className="w-full bg-[#7F77DD]/20 rounded-sm" style={{ height: `${Math.max(4, (count / max) * 48)}px` }} />
                          <span className="text-[#444441] text-[9px]">{new Date(date).toLocaleDateString("en", { weekday: "short" })}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* USERS */}
        {activeTab === "Users" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-medium">Users ({filteredUsers.length})</p>
              <button onClick={loadUsers} className="text-[#7F77DD] text-xs">Refresh</button>
            </div>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-[#0f1117] border border-[#2C2C2A] rounded-lg px-3 py-2 text-xs text-white placeholder-[#444441] focus:outline-none focus:border-[#7F77DD] mb-3 transition"
            />
            {loading ? (
              <p className="text-[#888780] text-xs">Loading...</p>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <div key={u.uid} className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1a1830] rounded-full flex items-center justify-center text-[#7F77DD] text-xs font-medium flex-shrink-0">
                      {u.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{u.name || "No name"}</p>
                      <p className="text-[#888780] text-[10px] truncate">{u.email}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {u.stage && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#1a1830] text-[#7F77DD] border border-[#7F77DD]/20">{u.stage}</span>}
                        {u.country && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#1a1c23] text-[#888780] border border-[#2C2C2A]">{u.country}</span>}
                        {u.onboardingComplete && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-900/20 text-green-400 border border-green-800/30">Onboarded</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <p className="text-[#444441] text-[9px]">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ""}</p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEmailTarget("specific");
                            setSelectedUids([u.uid]);
                            setActiveTab("Email");
                          }}
                          className="text-[9px] text-[#7F77DD] border border-[#7F77DD]/30 px-2 py-0.5 rounded-md hover:border-[#7F77DD]/60 transition"
                        >
                          Email
                        </button>
                        <button
                          onClick={() => deleteUser(u.uid)}
                          className="text-[9px] text-red-400 border border-red-800/30 px-2 py-0.5 rounded-md hover:border-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OPPORTUNITIES */}
        {activeTab === "Opportunities" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-medium">Opportunities ({filteredOpps.length})</p>
              <div className="flex gap-2">
                <button onClick={triggerScraper} className="text-[#7F77DD] text-xs border border-[#2C2C2A] px-3 py-1.5 rounded-lg hover:border-[#7F77DD]/40 transition">Scrape</button>
                <button onClick={loadOpportunities} className="text-[#7F77DD] text-xs">Refresh</button>
              </div>
            </div>
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {["all", "job", "grant", "course", "fellowship"].map((f) => (
                <button
                  key={f}
                  onClick={() => setOppFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition ${
                    oppFilter === f ? "bg-[#534AB7] text-white" : "border border-[#2C2C2A] text-[#888780]"
                  }`}
                >
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
                </button>
              ))}
            </div>
            {loading ? (
              <p className="text-[#888780] text-xs">Loading...</p>
            ) : (
              <div className="space-y-2">
                {filteredOpps.map((opp) => (
                  <div key={opp.id} className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                          opp.type === "job" ? "bg-[#1a1830] text-[#7F77DD] border-[#7F77DD]/20" :
                          opp.type === "grant" ? "bg-green-900/20 text-green-400 border-green-800/30" :
                          opp.type === "course" ? "bg-orange-900/20 text-orange-400 border-orange-800/30" :
                          "bg-purple-900/20 text-purple-400 border-purple-800/30"
                        }`}>{opp.type}</span>
                        {!opp.isActive && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-900/20 text-red-400 border border-red-800/30">Inactive</span>}
                      </div>
                      <p className="text-white text-xs font-medium leading-snug truncate">{opp.title}</p>
                      <p className="text-[#888780] text-[10px]">{opp.provider} · {opp.source}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => toggleOpportunity(opp.id, opp.isActive)}
                        className={`text-[9px] px-2 py-0.5 rounded-md border transition ${
                          opp.isActive ? "border-[#2C2C2A] text-[#888780]" : "border-green-800/30 text-green-400"
                        }`}
                      >
                        {opp.isActive ? "Off" : "On"}
                      </button>
                      <button
                        onClick={() => deleteOpportunity(opp.id)}
                        className="text-[9px] text-red-400 border border-red-800/30 px-2 py-0.5 rounded-md transition"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EMAIL */}
        {activeTab === "Email" && (
          <div>
            <p className="text-white text-sm font-medium mb-4">Send email</p>

            <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-4 mb-4">
              <p className="text-[#7F77DD] text-[10px] uppercase tracking-wider mb-1">AI draft</p>
              <p className="text-[#888780] text-xs mb-3">Describe what you want to say</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={draftPrompt}
                  onChange={(e) => setDraftPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && draftEmail()}
                  placeholder="e.g. announce new AI mentor features"
                  className="flex-1 bg-[#080a0f] border border-[#2C2C2A] rounded-lg px-3 py-2 text-xs text-white placeholder-[#444441] focus:outline-none focus:border-[#7F77DD] transition"
                />
                <button
                  onClick={draftEmail}
                  disabled={draftLoading || !draftPrompt}
                  className="bg-[#534AB7] hover:bg-[#4840a0] text-white text-xs px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {draftLoading ? "..." : "Draft"}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-[#888780] uppercase tracking-wider mb-1.5">Target</label>
                <select
                  value={emailTarget}
                  onChange={(e) => { setEmailTarget(e.target.value); setSelectedUids([]); }}
                  className="w-full bg-[#0f1117] border border-[#2C2C2A] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#7F77DD] transition"
                >
                  <option value="all">All users</option>
                  <option value="secondary">Secondary school</option>
                  <option value="applicant">University applicants</option>
                  <option value="undergraduate">Undergraduates</option>
                  <option value="graduate">Graduates</option>
                  <option value="specific">Specific users</option>
                </select>
              </div>

              {emailTarget === "specific" && (
                <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-3 max-h-40 overflow-y-auto">
                  <p className="text-[#888780] text-[10px] mb-2">Select users:</p>
                  {users.map((u) => (
                    <label key={u.uid} className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUids.includes(u.uid)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedUids((prev) => [...prev, u.uid]);
                          else setSelectedUids((prev) => prev.filter((id) => id !== u.uid));
                        }}
                        className="accent-[#7F77DD]"
                      />
                      <span className="text-white text-xs">{u.name}</span>
                      <span className="text-[#888780] text-[10px]">{u.email}</span>
                    </label>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-medium text-[#888780] uppercase tracking-wider mb-1.5">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject line"
                  className="w-full bg-[#0f1117] border border-[#2C2C2A] rounded-lg px-3 py-2.5 text-xs text-white placeholder-[#444441] focus:outline-none focus:border-[#7F77DD] transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-[#888780] uppercase tracking-wider mb-1.5">Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Write your message..."
                  rows={6}
                  className="w-full bg-[#0f1117] border border-[#2C2C2A] rounded-lg px-3 py-2.5 text-xs text-white placeholder-[#444441] focus:outline-none focus:border-[#7F77DD] transition resize-none"
                />
              </div>

              <button
                onClick={sendEmail}
                disabled={sendingEmail || !emailSubject || !emailMessage}
                className="w-full bg-[#534AB7] hover:bg-[#4840a0] text-white rounded-lg py-2.5 text-xs font-medium transition disabled:opacity-50"
              >
                {sendingEmail ? "Sending..." : `Send${selectedUids.length > 0 ? ` to ${selectedUids.length} users` : ""}`}
              </button>
            </div>
          </div>
        )}

        {/* AI ADVISOR */}
        {activeTab === "AI Advisor" && (
          <div>
            <p className="text-white text-sm font-medium mb-4">AI advisor</p>
            <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-3 h-80 overflow-y-auto mb-3 space-y-3">
              {aiMessages.map((msg, i) => (
                <div key={i}>
                  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-5 h-5 bg-[#7F77DD] rounded-md flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                        <svg width="10" height="10" viewBox="0 0 18 18" fill="none">
                          <path d="M4 14 L9 4 L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6 10.5 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                    )}
                    <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#534AB7] text-white"
                        : "bg-[#1a1c23] border border-[#2C2C2A] text-[#B4B2A9]"
                    }`}>
                      {msg.content.split("\n").map((line, j) => (
                        <span key={j}>{line}{j < msg.content.split("\n").length - 1 && <br />}</span>
                      ))}
                    </div>
                  </div>
                  {msg.draft && (
                    <div className="ml-7 mt-2">
                      <button
                        onClick={() => useDraft(msg.draft)}
                        className="text-[10px] bg-[#534AB7] hover:bg-[#4840a0] text-white px-3 py-1.5 rounded-lg transition"
                      >
                        Use this draft →
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="w-5 h-5 bg-[#7F77DD] rounded-md flex items-center justify-center flex-shrink-0 mr-2">
                    <svg width="10" height="10" viewBox="0 0 18 18" fill="none">
                      <path d="M4 14 L9 4 L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 10.5 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="bg-[#1a1c23] border border-[#2C2C2A] rounded-xl px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-[#7F77DD] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1 h-1 rounded-full bg-[#7F77DD] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1 h-1 rounded-full bg-[#7F77DD] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={aiBottomRef} />
            </div>

            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {["How are we growing?", "Draft welcome email", "What should I improve?", "Analyze user stages"].map((p) => (
                <button
                  key={p}
                  onClick={() => sendAiMessage(p)}
                  className="text-[10px] px-3 py-1.5 rounded-full border border-[#2C2C2A] text-[#888780] whitespace-nowrap hover:border-[#444441] hover:text-white transition"
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendAiMessage()}
                placeholder="Ask about your platform or say 'draft email about...'"
                className="flex-1 bg-[#0f1117] border border-[#2C2C2A] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#444441] focus:outline-none focus:border-[#7F77DD] transition"
              />
              <button
                onClick={() => sendAiMessage()}
                disabled={aiLoading || !aiInput.trim()}
                className="w-9 h-9 bg-[#534AB7] hover:bg-[#4840a0] rounded-xl flex items-center justify-center transition disabled:opacity-40"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
