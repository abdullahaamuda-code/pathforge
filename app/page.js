"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll(".scroll-animate").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function LandingPage() {
  const canvasRef = useRef(null);
  useScrollAnimation();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animFrame;
    let time = 0;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const size = 50;
      const cols = Math.ceil(canvas.width / size) + 1;
      const rows = Math.ceil(canvas.height / size) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * size;
          const y = j * size;
          const dist = Math.sqrt(
            Math.pow(x - canvas.width / 2, 2) +
            Math.pow(y - canvas.height * 0.4, 2)
          );
          const wave = Math.sin(dist * 0.015 - time * 0.8) * 0.5 + 0.5;
          const alpha = wave * 0.25 * Math.max(0, 1 - dist / (canvas.width * 0.7));

          ctx.strokeStyle = `rgba(127, 119, 221, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + size);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + size, y);
          ctx.stroke();

          const dotAlpha = wave * 0.6 * Math.max(0, 1 - dist / (canvas.width * 0.5));
          if (dotAlpha > 0.05) {
            ctx.beginPath();
            ctx.arc(x, y, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(127, 119, 221, ${dotAlpha})`;
            ctx.fill();
          }
        }
      }
      time += 0.016;
      animFrame = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="bg-[#080a0f] text-white min-h-screen overflow-x-hidden">

      <style>{`
        .scroll-animate {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .scroll-animate.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .scroll-animate-delay-1 { transition-delay: 0.1s; }
        .scroll-animate-delay-2 { transition-delay: 0.2s; }
        .scroll-animate-delay-3 { transition-delay: 0.3s; }
        .scroll-animate-delay-4 { transition-delay: 0.4s; }
        .scroll-animate-delay-5 { transition-delay: 0.5s; }
        .scroll-animate-delay-6 { transition-delay: 0.6s; }

        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .float-1 { animation: floatUp 4s ease-in-out infinite; }
        .float-2 { animation: floatUp 5s ease-in-out infinite; animation-delay: 1s; }
        .float-3 { animation: floatUp 6s ease-in-out infinite; animation-delay: 2s; }
        .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .pulse-glow-2 { animation: pulse-glow 4s ease-in-out infinite; animation-delay: 1.5s; }
      `}</style>

      {/* Desktop: animated grid canvas */}
      <div className="hidden md:block absolute top-0 left-0 right-0 h-[700px] overflow-hidden pointer-events-none">
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080a0f]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080a0f] via-transparent to-[#080a0f]" />
      </div>

      {/* Mobile: premium glow effect */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-[600px] overflow-hidden pointer-events-none">
        {/* Main central glow */}
        <div className="pulse-glow absolute top-[-100px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(127,119,221,0.4) 0%, rgba(83,74,183,0.2) 40%, transparent 70%)" }} />
        {/* Secondary glow */}
        <div className="pulse-glow-2 absolute top-[100px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(127,119,221,0.15) 0%, transparent 70%)" }} />
        {/* Left orb */}
        <div className="pulse-glow absolute top-[200px] left-[-50px] w-[200px] h-[200px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(83,74,183,0.2) 0%, transparent 70%)" }} />
        {/* Right orb */}
        <div className="pulse-glow-2 absolute top-[150px] right-[-50px] w-[200px] h-[200px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(127,119,221,0.15) 0%, transparent 70%)" }} />
        {/* Grid lines overlay — subtle static version for mobile */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#7F77DD" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080a0f]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-4 border-b border-[#2C2C2A]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#7F77DD] rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M4 14 L9 4 L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 10.5 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white font-medium text-sm">PathForge</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[#888780] text-xs hover:text-white transition border border-[#2C2C2A] rounded-lg px-4 py-2">
            Sign in
          </Link>
          <Link href="/signup" className="bg-[#534AB7] hover:bg-[#4840a0] text-white text-xs font-medium rounded-lg px-4 py-2 transition">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-20 md:pt-24 pb-20 text-center">

        {/* Floating cards — desktop only */}
        <div className="hidden md:block absolute left-0 top-16 float-1">
          <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-3 text-left w-44">
            <p className="text-[#7F77DD] text-[10px] mb-1">92% match</p>
            <p className="text-white text-xs font-medium">Software Engineer</p>
            <p className="text-[#888780] text-[10px]">High growth · 2–3 years</p>
          </div>
        </div>
        <div className="hidden md:block absolute right-0 top-32 float-2">
          <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-3 text-left w-48">
            <p className="text-green-400 text-[10px] mb-1">New opportunity</p>
            <p className="text-white text-xs font-medium">Google Africa Scholarship</p>
            <p className="text-[#888780] text-[10px]">Deadline in 14 days</p>
          </div>
        </div>
        <div className="hidden md:block absolute left-8 bottom-8 float-3">
          <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-3 text-left w-44">
            <p className="text-[#7F77DD] text-[10px] mb-1">Skill gap closed</p>
            <p className="text-white text-xs font-medium">Python added</p>
            <p className="text-[#888780] text-[10px]">+43 new opportunities</p>
          </div>
        </div>

        {/* Mobile floating cards — smaller, positioned differently */}
        <div className="md:hidden absolute right-4 top-6 float-2 opacity-80">
          <div className="bg-[#0f1117] border border-[#7F77DD]/20 rounded-xl p-2.5 text-left w-36">
            <p className="text-[#7F77DD] text-[9px] mb-0.5">92% match</p>
            <p className="text-white text-[11px] font-medium">Software Engineer</p>
            <p className="text-[#888780] text-[9px]">High growth</p>
          </div>
        </div>
        <div className="md:hidden absolute left-4 top-32 float-3 opacity-80">
          <div className="bg-[#0f1117] border border-green-800/30 rounded-xl p-2.5 text-left w-36">
            <p className="text-green-400 text-[9px] mb-0.5">New opportunity</p>
            <p className="text-white text-[11px] font-medium">Google Scholarship</p>
            <p className="text-[#888780] text-[9px]">14 days left</p>
          </div>
        </div>

        <div className="scroll-animate">
          <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-4">
            AI-powered career guidance
          </p>
        </div>
        <div className="scroll-animate scroll-animate-delay-1">
          <h1 className="text-4xl md:text-5xl font-medium leading-tight tracking-tight mb-6">
            Discover your path.<br />
            <span className="text-[#7F77DD]">Build your future.</span>
          </h1>
        </div>
        <div className="scroll-animate scroll-animate-delay-2">
          <p className="text-[#888780] text-sm md:text-base leading-relaxed mb-8 max-w-lg mx-auto">
            From secondary school to your first job — PathForge gives you a personalized roadmap, matched opportunities, and an AI mentor that actually knows your situation.
          </p>
        </div>
        <div className="scroll-animate scroll-animate-delay-3">
          <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
            <Link href="/signup" className="bg-[#534AB7] hover:bg-[#4840a0] text-white text-sm font-medium rounded-xl px-8 py-3 transition">
              Get started — it's free
            </Link>
            <a href="#how-it-works" className="border border-[#2C2C2A] text-[#888780] hover:border-[#444441] hover:text-white text-sm rounded-xl px-8 py-3 transition">
              See how it works
            </a>
          </div>
        </div>
        <div className="scroll-animate scroll-animate-delay-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {["Secondary school", "Undergraduates", "Graduates", "Nigeria", "Francophone Africa", "Global"].map((tag) => (
              <span key={tag} className="text-[11px] px-3 py-1 rounded-full border border-[#2C2C2A] text-[#888780]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-[#2C2C2A] mx-6" />

      {/* How it works */}
      <div id="how-it-works" className="max-w-4xl mx-auto px-6 py-16">
        <div className="scroll-animate text-center mb-10">
          <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-3">How it works</p>
          <h2 className="text-2xl font-medium mb-2">Three steps to your path</h2>
          <p className="text-[#888780] text-sm">Takes less than 5 minutes to get your personalized roadmap</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { num: "1", title: "Tell us about yourself", sub: "Your stage, interests, skills, and goals. Quick 7-step quiz — no fluff, no noise." },
            { num: "2", title: "Get your AI roadmap", sub: "A personalized step-by-step career plan with real resources, salary data for your country, and skill gaps." },
            { num: "3", title: "Discover opportunities", sub: "Jobs, grants, courses, and fellowships — all scored and ranked against your exact profile." },
          ].map((step, i) => (
            <div key={step.num}
              className={`scroll-animate scroll-animate-delay-${i + 1} bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-6 hover:border-[#7F77DD]/20 transition`}>
              <div className="w-7 h-7 bg-[#1a1830] rounded-lg flex items-center justify-center text-[#7F77DD] text-xs font-medium mb-4">
                {step.num}
              </div>
              <p className="text-white text-sm font-medium mb-2">{step.title}</p>
              <p className="text-[#888780] text-xs leading-relaxed">{step.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#2C2C2A] mx-6" />

      {/* Who it's for */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="scroll-animate text-center mb-10">
          <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-3">Who it's for</p>
          <h2 className="text-2xl font-medium mb-2">Built for every stage</h2>
          <p className="text-[#888780] text-sm">Whether you're in SS3 or just graduated, PathForge meets you where you are</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { tag: "Secondary school", title: "Figure out what you actually want to do", sub: "Career direction, subject guidance, and university planning — before you make decisions you'll regret." },
            { tag: "University applicants", title: "Choose the right course for the right reasons", sub: "Compare courses, understand what careers they lead to, and make an informed choice for JAMB or A-levels." },
            { tag: "Undergraduates", title: "Build the right skills while you still have time", sub: "Year-by-year roadmap, internship matching, and certification guidance — so you graduate competitive." },
            { tag: "Graduates & job seekers", title: "Find opportunities matched to who you actually are", sub: "Jobs, grants, and fellowships scored against your profile — with AI showing you exactly what gaps to close." },
          ].map((item, i) => (
            <div key={item.tag}
              className={`scroll-animate scroll-animate-delay-${i + 1} bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-6 hover:border-[#444441] transition`}>
              <p className="text-[#7F77DD] text-[10px] font-medium tracking-widest uppercase mb-2">{item.tag}</p>
              <p className="text-white text-sm font-medium mb-2">{item.title}</p>
              <p className="text-[#888780] text-xs leading-relaxed">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#2C2C2A] mx-6" />

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="scroll-animate text-center mb-10">
          <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-3">Features</p>
          <h2 className="text-2xl font-medium mb-2">Everything in one place</h2>
          <p className="text-[#888780] text-sm">No more switching between 10 different websites</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { title: "AI career roadmap", sub: "Personalized plan based on your stage, country, and goals", icon: <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeWidth="1.5"/> },
            { title: "Opportunity matching", sub: "Jobs, grants, and courses scored with match percentages", icon: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="1.5"/> },
            { title: "Gap analysis", sub: "See missing skills and free resources to close them", icon: <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeWidth="1.5"/> },
            { title: "AI mentor", sub: "Chat with AI that knows your profile and gives real advice", icon: <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth="1.5"/> },
            { title: "PDF download", sub: "Download your full roadmap as a professional PDF", icon: <path d="M12 3v13m0 0l-4-4m4 4l4-4M3 21h18" strokeWidth="1.5"/> },
            { title: "English + French", sub: "Full support for Africa and beyond from day one", icon: <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" strokeWidth="1.5"/> },
          ].map((feat, i) => (
            <div key={feat.title}
              className={`scroll-animate scroll-animate-delay-${i + 1} bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-5 hover:border-[#7F77DD]/20 transition`}>
              <div className="w-8 h-8 bg-[#1a1830] rounded-lg flex items-center justify-center mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeLinecap="round" strokeLinejoin="round">
                  {feat.icon}
                </svg>
              </div>
              <p className="text-white text-xs font-medium mb-1">{feat.title}</p>
              <p className="text-[#888780] text-[11px] leading-relaxed">{feat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#2C2C2A] mx-6" />

      {/* CTA */}
      <div className="relative max-w-4xl mx-auto px-6 py-24 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-[#534AB7] opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="scroll-animate">
          <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-4 relative">Free to get started</p>
          <h2 className="text-3xl font-medium mb-4 relative">Your path starts today</h2>
          <p className="text-[#888780] text-sm mb-8 relative">Join students across Africa and the world already building their futures with PathForge</p>
          <Link href="/signup" className="inline-block bg-[#534AB7] hover:bg-[#4840a0] text-white text-sm font-medium rounded-xl px-10 py-3 transition relative">
            Create your free account
          </Link>
        </div>
      </div>

      <div className="h-px bg-[#2C2C2A] mx-6" />

      {/* Footer */}
      <footer className="px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#7F77DD] rounded-md flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
              <path d="M4 14 L9 4 L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 10.5 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-[#444441] text-xs">PathForge</span>
          <span className="text-[#2C2C2A] text-xs mx-2">·</span>
          <span className="text-[#444441] text-xs">© 2025. Built for students everywhere.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="text-[#444441] text-xs hover:text-[#888780] transition">Privacy</Link>
          <Link href="/terms" className="text-[#444441] text-xs hover:text-[#888780] transition">Terms</Link>
          <Link href="/contact" className="text-[#444441] text-xs hover:text-[#888780] transition">Contact</Link>
        </div>
      </footer>

    </div>
  );
}
