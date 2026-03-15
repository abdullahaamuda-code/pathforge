"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUser } from "@/lib/firestore";
import Link from "next/link";
import { t } from "@/lib/i18n";

function getSuggestions(lang: string) {
  if (lang === "fr") return [
    "Comment rédiger un bon dossier de bourse ?",
    "Quelles compétences développer cette année ?",
    "Comment obtenir mon premier stage sans expérience ?",
    "Quelle est la différence entre un CV et un resume ?",
    "Comment négocier une offre d'emploi ?",
    "Quelles certifications gratuites valent la peine ?",
  ];
  return [
    "How do I write a strong scholarship essay?",
    "What skills should I focus on building this year?",
    "How do I get my first internship with no experience?",
    "What's the difference between a CV and a resume?",
    "How do I negotiate a job offer?",
    "What certifications are worth doing for free?",
  ];
}

export default function MentorPage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [lang, setLang] = useState("en");

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (user) initMentor();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function initMentor() {
    try {
      const userData = await getUser(user!.uid);
      setProfile(userData);
      const userLang = userData?.language || "en";
      setLang(userLang);

      const chatKey = `pathforge_chat_${user!.uid}`;
      const pendingKey = `pathforge_mentor_prompt_${user!.uid}`;

      const savedChat = typeof window !== "undefined"
        ? localStorage.getItem(chatKey)
        : null;
      const pendingPrompt = typeof window !== "undefined"
        ? localStorage.getItem(pendingKey)
        : null;

      let history: { role: "user" | "assistant"; content: string }[] = [];

      if (savedChat) {
        history = JSON.parse(savedChat);
        setMessages(history);
      } else {
        const firstName = userData?.name?.split(" ")[0] || "there";
        const stage = userData?.stage || "student";
        const interest = userData?.interests?.[0] || "your field";

        const greetingContent = userLang === "fr"
          ? `Salut ${firstName} — je suis votre mentor PathForge. Vous êtes ${stage} et intéressé par ${interest}. ${t(userLang, "mentor.whatsOnYourMind")}`
          : `Hey ${firstName} — I'm your PathForge mentor. You're a ${stage} interested in ${interest}. ${t(userLang, "mentor.whatsOnYourMind")}`;

        const greeting = {
          role: "assistant" as const,
          content: greetingContent,
        };

        history = [greeting];
        setMessages(history);
        if (typeof window !== "undefined") {
          localStorage.setItem(chatKey, JSON.stringify(history));
        }
      }

      if (pendingPrompt) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(pendingKey);
        }
        setInitializing(false);
        await sendMessageWithHistory(pendingPrompt, history, userData);
        return;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInitializing(false);
    }
  }

  async function sendMessageWithHistory(
    message: string,
    history: { role: "user" | "assistant"; content: string }[],
    userData: any
  ) {
    if (!user) return;
    const chatKey = `pathforge_chat_${user.uid}`;

    const updatedMessages = [...history, { role: "user" as const, content: message }];
    setMessages(updatedMessages);
    if (typeof window !== "undefined") {
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
    }

    setLoading(true);
    try {
      const res = await fetch("/api/mentor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          message,
          history: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const finalMessages = [
        ...updatedMessages,
        { role: "assistant" as const, content: data.reply },
      ];
      setMessages(finalMessages);
      if (typeof window !== "undefined") {
        localStorage.setItem(chatKey, JSON.stringify(finalMessages));
      }
    } catch (err) {
      console.error(err);
      const errorMessages = [
        ...updatedMessages,
        {
          role: "assistant" as const,
          content: lang === "fr" ? "Désolé, une erreur s'est produite. Réessayez." : "Sorry, ran into an issue. Try again.",
        },
      ];
      setMessages(errorMessages);
      if (typeof window !== "undefined") {
        localStorage.setItem(chatKey, JSON.stringify(errorMessages));
      }
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function sendMessage(text?: string) {
    if (!user) return;
    const message = text || input.trim();
    if (!message || loading) return;

    const chatKey = `pathforge_chat_${user.uid}`;
    setInput("");

    const updatedMessages = [
      ...messages,
      { role: "user" as const, content: message },
    ];
    setMessages(updatedMessages);
    if (typeof window !== "undefined") {
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
    }

    setLoading(true);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/mentor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, message, history }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const finalMessages = [
        ...updatedMessages,
        { role: "assistant" as const, content: data.reply },
      ];
      setMessages(finalMessages);
      if (typeof window !== "undefined") {
        localStorage.setItem(chatKey, JSON.stringify(finalMessages));
      }
    } catch (err) {
      console.error(err);
      const errorMessages = [
        ...updatedMessages,
        {
          role: "assistant" as const,
          content: lang === "fr" ? "Désolé, une erreur s'est produite. Réessayez." : "Sorry, ran into an issue. Try again.",
        },
      ];
      setMessages(errorMessages);
      if (typeof window !== "undefined") {
        localStorage.setItem(chatKey, JSON.stringify(errorMessages));
      }
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function clearChat() {
    if (!user) return;
    const chatKey = `pathforge_chat_${user.uid}`;
    if (typeof window !== "undefined") {
      localStorage.removeItem(chatKey);
    }

    const firstName = profile?.name?.split(" ")[0] || "there";
    const stage = profile?.stage || "student";
    const interest = profile?.interests?.[0] || "your field";

    const greetingContent = lang === "fr"
      ? `Salut ${firstName} — ${t(lang, "mentor.freshStart")}. Vous êtes ${stage} et intéressé par ${interest}. ${t(lang, "mentor.whatToWorkOn")}`
      : `Hey ${firstName} — ${t(lang, "mentor.freshStart")}. You're a ${stage} interested in ${interest}. ${t(lang, "mentor.whatToWorkOn")}`;

    const greeting = {
      role: "assistant" as const,
      content: greetingContent,
    };

    setLoading(false);
    setInput("");
    setMessages([greeting]);
    if (typeof window !== "undefined") {
      localStorage.setItem(chatKey, JSON.stringify([greeting]));
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const suggestions = getSuggestions(lang);

  const navItems = [
    { label: t(lang, "nav.home"), href: "/dashboard", icon: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" strokeWidth="1.5"/> },
    { label: t(lang, "nav.roadmap"), href: "/roadmap", icon: <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeWidth="1.5"/> },
    { label: t(lang, "nav.explore"), href: "/opportunities", icon: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="1.5"/> },
    { label: t(lang, "nav.saved"), href: "/saved", icon: <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeWidth="1.5"/> },
    { label: t(lang, "nav.mentor"), href: "/mentor", icon: <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth="1.5"/> },
  ];

  if (initializing) {
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
    <div className="min-h-screen bg-[#080a0f] text-white flex flex-col">

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
          <Link href="/saved" className="text-[#888780] text-xs hover:text-white transition">{t(lang, "dashboard.saved")}</Link>
          <Link href="/mentor" className="text-white text-xs font-medium">{t(lang, "dashboard.aiMentor")}</Link>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 pb-56 md:pb-32 overflow-y-auto">

        {/* Clear chat button */}
        {messages.length > 1 && (
          <div className="flex justify-center mb-6">
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 border border-[#2C2C2A] bg-[#0f1117] hover:border-[#444441] text-[#888780] hover:text-white text-xs px-4 py-2 rounded-full transition"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t(lang, "mentor.clearChat")}
            </button>
          </div>
        )}

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="mb-6">
            <p className="text-[#888780] text-xs mb-3 text-center">{t(lang, "mentor.tryAsking")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="text-left border border-[#2C2C2A] bg-[#0f1117] rounded-xl px-4 py-3 text-xs text-[#888780] hover:border-[#444441] hover:text-white transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4">
          {messages.map((msg, i) => (
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
                  : "bg-[#0f1117] border border-[#2C2C2A] text-[#B4B2A9] rounded-tl-sm"
              }`}>
                {msg.content.split("\n").map((line, j, arr) => (
                  <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                ))}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="w-6 h-6 bg-[#7F77DD] rounded-lg flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                  <path d="M4 14 L9 4 L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 10.5 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7F77DD] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7F77DD] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7F77DD] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Fixed bottom — input then nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#080a0f] border-t border-[#2C2C2A] px-4 pt-3 pb-3 z-20">

        {/* Input row */}
        <div className="max-w-3xl mx-auto flex gap-3 items-end mb-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t(lang, "mentor.placeholder")}
            rows={1}
            className="flex-1 bg-[#0f1117] border border-[#2C2C2A] rounded-xl px-4 py-3 text-sm text-white placeholder-[#444441] focus:outline-none focus:border-[#7F77DD] resize-none transition"
            style={{ maxHeight: "120px", overflowY: "auto" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="w-10 h-10 bg-[#534AB7] hover:bg-[#4840a0] rounded-xl flex items-center justify-center transition disabled:opacity-40 flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        <div className="flex items-center justify-around md:hidden">
          {navItems.map((item) => {
            const isActive = item.href === "/mentor";
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
    </div>
  );
}
