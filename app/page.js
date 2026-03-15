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
    document
      .querySelectorAll(".scroll-animate")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

const translations = {
  en: {
    tagline: "AI-powered career guidance",
    heroLine1: "Discover your path.",
    heroLine2: "Build your future.",
    heroSub:
      "From secondary school to your first job — PathForge gives you a personalized roadmap, matched opportunities, and an AI mentor that actually knows your situation.",
    navSignIn: "Sign in",
    navGetStarted: "Get started free",
    heroPrimaryCta: "Get started — it's free",
    heroSecondaryCta: "See how it works",
    tags: [
      "Secondary school",
      "Undergraduates",
      "Graduates",
      "Nigeria",
      "Francophone Africa",
      "Global",
    ],
    howTitle: "How it works",
    howSubtitle: "Three steps to your path",
    howCaption:
      "Takes less than 5 minutes to get your personalized roadmap",
    howSteps: [
      {
        num: "1",
        title: "Tell us about yourself",
        sub: "Your stage, interests, skills, and goals. Quick 7-step quiz — no fluff, no noise.",
      },
      {
        num: "2",
        title: "Get your AI roadmap",
        sub: "A personalized step-by-step career plan with real resources, salary data for your country, and skill gaps.",
      },
      {
        num: "3",
        title: "Discover opportunities",
        sub: "Jobs, grants, courses, and fellowships — all scored and ranked against your exact profile.",
      },
    ],
    whoTitle: "Who it's for",
    whoSubtitle: "Built for every stage",
    whoCaption:
      "Whether you're in SS3 or just graduated, PathForge meets you where you are",
    whoBlocks: [
      {
        tag: "Secondary school",
        title: "Figure out what you actually want to do",
        sub: "Career direction, subject guidance, and university planning — before you make decisions you'll regret.",
      },
      {
        tag: "University applicants",
        title: "Choose the right course for the right reasons",
        sub: "Compare courses, understand what careers they lead to, and make an informed choice for JAMB or A-levels.",
      },
      {
        tag: "Undergraduates",
        title: "Build the right skills while you still have time",
        sub: "Year-by-year roadmap, internship matching, and certification guidance — so you graduate competitive.",
      },
      {
        tag: "Graduates & job seekers",
        title: "Find opportunities matched to who you actually are",
        sub: "Jobs, grants, and fellowships scored against your profile — with AI showing you exactly what gaps to close.",
      },
    ],
    featuresTitle: "Features",
    featuresSubtitle: "Everything in one place",
    featuresCaption: "No more switching between 10 different websites",
    features: [
      {
        title: "AI career roadmap",
        sub: "Personalized plan based on your stage, country, and goals",
        icon: (
          <path
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            strokeWidth="1.5"
          />
        ),
      },
      {
        title: "Opportunity matching",
        sub: "Jobs, grants, and courses scored with match percentages",
        icon: (
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            strokeWidth="1.5"
          />
        ),
      },
      {
        title: "Gap analysis",
        sub: "See missing skills and free resources to close them",
        icon: (
          <path
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            strokeWidth="1.5"
          />
        ),
      },
      {
        title: "AI mentor",
        sub: "Chat with AI that knows your profile and gives real advice",
        icon: (
          <path
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            strokeWidth="1.5"
          />
        ),
      },
      {
        title: "PDF download",
        sub: "Download your full roadmap as a professional PDF",
        icon: (
          <path
            d="M12 3v13m0 0l-4-4m4 4l4-4M3 21h18"
            strokeWidth="1.5"
          />
        ),
      },
      {
        title: "English + French",
        sub: "Full support for Africa and beyond from day one",
        icon: (
          <path
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            strokeWidth="1.5"
          />
        ),
      },
    ],
    ctaBadge: "Free to get started",
    ctaTitle: "Your path starts today",
    ctaSub:
      "Join students across Africa and the world already building their futures with PathForge",
    ctaButton: "Create your free account",
    footerBuilt: "© 2025. Built for students everywhere.",
    footerPrivacy: "Privacy",
    footerTerms: "Terms",
    footerContact: "Contact",
  },
  fr: {
    tagline: "Orientation de carrière propulsée par l’IA",
    heroLine1: "Découvre ta voie.",
    heroLine2: "Construis ton avenir.",
    heroSub:
      "Du secondaire à ton premier emploi — PathForge te donne une feuille de route personnalisée, des opportunités adaptées et un mentor IA qui comprend vraiment ta situation.",
    navSignIn: "Connexion",
    navGetStarted: "Commencer gratuitement",
    heroPrimaryCta: "Commencer — c’est gratuit",
    heroSecondaryCta: "Voir comment ça marche",
    tags: [
      "Lycée",
      "Étudiants",
      "Diplômés",
      "Nigéria",
      "Afrique francophone",
      "Global",
    ],
    howTitle: "Comment ça marche",
    howSubtitle: "Trois étapes vers ta voie",
    howCaption:
      "Moins de 5 minutes pour obtenir ta feuille de route personnalisée",
    howSteps: [
      {
        num: "1",
        title: "Parle-nous de toi",
        sub: "Ton niveau, tes centres d’intérêt, tes compétences et tes objectifs. Un quiz rapide en 7 étapes — sans blabla.",
      },
      {
        num: "2",
        title: "Reçois ton plan IA",
        sub: "Un plan de carrière personnalisé, étape par étape, avec ressources réelles, salaires pour ton pays et écarts de compétences.",
      },
      {
        num: "3",
        title: "Découvre des opportunités",
        sub: "Emplois, bourses, formations et programmes — tous classés selon ton profil.",
      },
    ],
    whoTitle: "Pour qui ?",
    whoSubtitle: "Conçu pour chaque étape",
    whoCaption:
      "Que tu sois en terminale ou tout juste diplômé, PathForge te rejoint là où tu es",
    whoBlocks: [
      {
        tag: "Lycéens",
        title: "Découvre ce que tu veux vraiment faire",
        sub: "Orientation, choix de matières et projets d’université — avant de prendre des décisions que tu regretteras.",
      },
      {
        tag: "Candidats à l’université",
        title: "Choisis le bon cursus pour les bonnes raisons",
        sub: "Compare les filières, comprends les métiers possibles et fais un choix éclairé pour l’université.",
      },
      {
        tag: "Étudiants",
        title: "Construis les bonnes compétences à temps",
        sub: "Feuille de route année par année, stages et certifications — pour obtenir ton diplôme en étant vraiment compétitif.",
      },
      {
        tag: "Diplômés & chercheurs d’emploi",
        title: "Trouve des opportunités adaptées à ton profil",
        sub: "Emplois, bourses et programmes évalués selon ton profil — avec l’IA qui montre exactement les écarts à combler.",
      },
    ],
    featuresTitle: "Fonctionnalités",
    featuresSubtitle: "Tout au même endroit",
    featuresCaption:
      "Fini de passer d’un site à un autre pour tout suivre",
    features: [
      {
        title: "Feuille de route IA",
        sub: "Plan personnalisé selon ton niveau, ton pays et tes objectifs",
        icon: (
          <path
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            strokeWidth="1.5"
          />
        ),
      },
      {
        title: "Matching d’opportunités",
        sub: "Emplois, bourses et cours notés avec un pourcentage d’adéquation",
        icon: (
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            strokeWidth="1.5"
          />
        ),
      },
      {
        title: "Analyse des écarts",
        sub: "Vois les compétences manquantes et les ressources gratuites pour les combler",
        icon: (
          <path
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            strokeWidth="1.5"
          />
        ),
      },
      {
        title: "Mentor IA",
        sub: "Discute avec une IA qui connaît ton profil et donne de vrais conseils",
        icon: (
          <path
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            strokeWidth="1.5"
          />
        ),
      },
      {
        title: "Téléchargement PDF",
        sub: "Télécharge ton plan complet en PDF professionnel",
        icon: (
          <path
            d="M12 3v13m0 0l-4-4m4 4l4-4M3 21h18"
            strokeWidth="1.5"
          />
        ),
      },
      {
        title: "Anglais + Français",
        sub: "Support complet pour l’Afrique et au-delà dès le premier jour",
        icon: (
          <path
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            strokeWidth="1.5"
          />
        ),
      },
    ],
    ctaBadge: "Commence gratuitement",
    ctaTitle: "Ta voie commence aujourd’hui",
    ctaSub:
      "Rejoins les étudiants d’Afrique et du monde qui construisent déjà leur avenir avec PathForge",
    ctaButton: "Crée ton compte gratuit",
    footerBuilt:
      "© 2025. Conçu pour les étudiants du monde entier.",
    footerPrivacy: "Confidentialité",
    footerTerms: "Conditions",
    footerContact: "Contact",
  },
};

export default function LandingPage() {
  const canvasRef = useRef(null);
  const [lang, setLang] = useState("en");

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
          const alpha =
            wave * 0.25 * Math.max(0, 1 - dist / (canvas.width * 0.7));

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

          const dotAlpha =
            wave * 0.6 * Math.max(0, 1 - dist / (canvas.width * 0.5));
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

  const t = translations[lang];

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
        <div
          className="pulse-glow absolute top-[-100px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(127,119,221,0.4) 0%, rgba(83,74,183,0.2) 40%, transparent 70%)",
          }}
        />
        <div
          className="pulse-glow-2 absolute top-[100px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(127,119,221,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          className="pulse-glow absolute top-[200px] left-[-50px] w-[200px] h-[200px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(83,74,183,0.2) 0%, transparent 70%)",
          }}
        />
        <div
          className="pulse-glow-2 absolute top-[150px] right-[-50px] w-[200px] h-[200px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(127,119,221,0.15) 0%, transparent 70%)",
          }}
        />
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="#7F77DD"
                strokeWidth="0.5"
              />
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="8"
                stroke="white"
                strokeWidth="1.5"
                opacity="0.5"
              />
              <polygon
                points="12,5 14.5,11.5 12,10 9.5,11.5"
                fill="white"
              />
              <circle
                cx="12"
                cy="18"
                r="1.5"
                fill="white"
                opacity="0.5"
              />
              <line
                x1="5"
                y1="12"
                x2="7"
                y2="12"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.5"
              />
              <line
                x1="17"
                y1="12"
                x2="19"
                y2="12"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.5"
              />
            </svg>
          </div>
          <span className="text-white font-medium text-sm">PathForge</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setLang("en")}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                lang === "en"
                  ? "bg-[#534AB7] text-white"
                  : "text-[#888780] hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("fr")}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                lang === "fr"
                  ? "bg-[#534AB7] text-white"
                  : "text-[#888780] hover:text-white"
              }`}
            >
              FR
            </button>
          </div>

          {/* Sign in — hidden on mobile */}
          <Link
            href="/login"
            className="hidden sm:block text-[#888780] text-xs hover:text-white transition border border-[#2C2C2A] rounded-lg px-4 py-2"
          >
            {t.navSignIn}
          </Link>

          {/* Get started — always visible */}
          <Link
            href="/signup"
            className="bg-[#534AB7] hover:bg-[#4840a0] text-white text-xs font-medium rounded-lg px-3 py-2 transition"
          >
            <span className="hidden sm:inline">{t.navGetStarted}</span>
            <span className="sm:hidden">
              {lang === "fr" ? "Commencer" : "Get started"}
            </span>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-20 md:pt-24 pb-20 text-center">
        <div className="hidden md:block absolute left-0 top-16 float-1">
          <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-3 text-left w-44">
            <p className="text-[#7F77DD] text-[10px] mb-1">92% match</p>
            <p className="text-white text-xs font-medium">Software Engineer</p>
            <p className="text-[#888780] text-[10px]">
              High growth · 2–3 years
            </p>
          </div>
        </div>
        <div className="hidden md:block absolute right-0 top-32 float-2">
          <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-3 text-left w-48">
            <p className="text-green-400 text-[10px] mb-1">New opportunity</p>
            <p className="text-white text-xs font-medium">
              Google Africa Scholarship
            </p>
            <p className="text-[#888780] text-[10px]">Deadline in 14 days</p>
          </div>
        </div>
        <div className="hidden md:block absolute left-8 bottom-8 float-3">
          <div className="bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-3 text-left w-44">
            <p className="text-[#7F77DD] text-[10px] mb-1">Skill gap closed</p>
            <p className="text-white text-xs font-medium">Python added</p>
            <p className="text-[#888780] text-[10px]">
              +43 new opportunities
            </p>
          </div>
        </div>

        {/* Mobile floating card */}
        <div className="md:hidden absolute right-4 top-6 float-2 opacity-80">
          <div className="bg-[#0f1117] border border-[#7F77DD]/20 rounded-xl p-2.5 text-left w-36">
            <p className="text-[#7F77DD] text-[9px] mb-0.5">92% match</p>
            <p className="text-white text-[11px] font-medium">
              Software Engineer
            </p>
            <p className="text-[#888780] text-[9px]">High growth</p>
          </div>
        </div>

        <div className="scroll-animate">
          <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-4">
            {t.tagline}
          </p>
        </div>
        <div className="scroll-animate scroll-animate-delay-1">
          <h1 className="text-4xl md:text-5xl font-medium leading-tight tracking-tight mb-6">
            {t.heroLine1}
            <br />
            <span className="text-[#7F77DD]">{t.heroLine2}</span>
          </h1>
        </div>
        <div className="scroll-animate scroll-animate-delay-2">
          <p className="text-[#888780] text-sm md:text-base leading-relaxed mb-8 max-w-lg mx-auto">
            {t.heroSub}
          </p>
        </div>
        <div className="scroll-animate scroll-animate-delay-3">
          <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
            <Link
              href="/signup"
              className="bg-[#534AB7] hover:bg-[#4840a0] text-white text-sm font-medium rounded-xl px-8 py-3 transition"
            >
              {t.heroPrimaryCta}
            </Link>
            <a
              href="#how-it-works"
              className="border border-[#2C2C2A] text-[#888780] hover:border-[#444441] hover:text-white text-sm rounded-xl px-8 py-3 transition"
            >
              {t.heroSecondaryCta}
            </a>
          </div>
        </div>
        <div className="scroll-animate scroll-animate-delay-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {t.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-3 py-1 rounded-full border border-[#2C2C2A] text-[#888780]"
              >
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
          <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-3">
            {t.howTitle}
          </p>
          <h2 className="text-2xl font-medium mb-2">{t.howSubtitle}</h2>
          <p className="text-[#888780] text-sm">{t.howCaption}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {t.howSteps.map((step, i) => (
            <div
              key={step.num}
              className={`scroll-animate scroll-animate-delay-${
                i + 1
              } bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-6 hover:border-[#7F77DD]/20 transition`}
            >
              <div className="w-7 h-7 bg-[#1a1830] rounded-lg flex items-center justify-center text-[#7F77DD] text-xs font-medium mb-4">
                {step.num}
              </div>
              <p className="text-white text-sm font-medium mb-2">
                {step.title}
              </p>
              <p className="text-[#888780] text-xs leading-relaxed">
                {step.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#2C2C2A] mx-6" />

      {/* Who it's for */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="scroll-animate text-center mb-10">
          <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-3">
            {t.whoTitle}
          </p>
          <h2 className="text-2xl font-medium mb-2">{t.whoSubtitle}</h2>
          <p className="text-[#888780] text-sm">{t.whoCaption}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {t.whoBlocks.map((item, i) => (
            <div
              key={item.tag}
              className={`scroll-animate scroll-animate-delay-${
                i + 1
              } bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-6 hover:border-[#444441] transition`}
            >
              <p className="text-[#7F77DD] text-[10px] font-medium tracking-widest uppercase mb-2">
                {item.tag}
              </p>
              <p className="text-white text-sm font-medium mb-2">
                {item.title}
              </p>
              <p className="text-[#888780] text-xs leading-relaxed">
                {item.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#2C2C2A] mx-6" />

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="scroll-animate text-center mb-10">
          <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-3">
            {t.featuresTitle}
          </p>
          <h2 className="text-2xl font-medium mb-2">
            {t.featuresSubtitle}
          </h2>
          <p className="text-[#888780] text-sm">{t.featuresCaption}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {t.features.map((feat, i) => (
            <div
              key={feat.title}
              className={`scroll-animate scroll-animate-delay-${
                i + 1
              } bg-[#0f1117] border border-[#2C2C2A] rounded-xl p-5 hover:border-[#7F77DD]/20 transition`}
            >
              <div className="w-8 h-8 bg-[#1a1830] rounded-lg flex items-center justify-center mb-3">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7F77DD"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {feat.icon}
                </svg>
              </div>
              <p className="text-white text-xs font-medium mb-1">
                {feat.title}
              </p>
              <p className="text-[#888780] text-[11px] leading-relaxed">
                {feat.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#2C2C2A] mx-6" />

      {/* CTA */}
      <div className="relative max-w-4xl mx-auto px-6 py-24 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-[#534AB7] opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="scroll-animate">
          <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-4 relative">
            {t.ctaBadge}
          </p>
          <h2 className="text-3xl font-medium mb-4 relative">
            {t.ctaTitle}
          </h2>
          <p className="text-[#888780] text-sm mb-8 relative">
            {t.ctaSub}
          </p>
          <Link
            href="/signup"
            className="inline-block bg-[#534AB7] hover:bg-[#4840a0] text-white text-sm font-medium rounded-xl px-10 py-3 transition relative"
          >
            {t.ctaButton}
          </Link>
        </div>
      </div>

      <div className="h-px bg-[#2C2C2A] mx-6" />

      {/* Footer */}
      <footer className="px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#7F77DD] rounded-md flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="8"
                stroke="white"
                strokeWidth="1.5"
                opacity="0.5"
              />
              <polygon
                points="12,5 14.5,11.5 12,10 9.5,11.5"
                fill="white"
              />
              <circle
                cx="12"
                cy="18"
                r="1.5"
                fill="white"
                opacity="0.5"
              />
              <line
                x1="5"
                y1="12"
                x2="7"
                y2="12"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.5"
              />
              <line
                x1="17"
                y1="12"
                x2="19"
                y2="12"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.5"
              />
            </svg>
          </div>
          <span className="text-[#444441] text-xs">PathForge</span>
          <span className="text-[#2C2C2A] text-xs mx-2">·</span>
          <span className="text-[#444441] text-xs">
            {t.footerBuilt}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="text-[#444441] text-xs hover:text-[#888780] transition"
          >
            {t.footerPrivacy}
          </Link>
          <Link
            href="/terms"
            className="text-[#444441] text-xs hover:text-[#888780] transition"
          >
            {t.footerTerms}
          </Link>
          <Link
            href="/contact"
            className="text-[#444441] text-xs hover:text-[#888780] transition"
          >
            {t.footerContact}
          </Link>
        </div>
      </footer>
    </div>
  );
}
