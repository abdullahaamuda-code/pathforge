"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { t } from "@/lib/i18n";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const lang = typeof navigator !== "undefined" && navigator.language?.startsWith("fr") ? "fr" : "en";

  async function handleSignup(e) {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      await sendEmailVerification(result.user, {
        url: "https://pathforge-inky.vercel.app/login?verified=true",
      });
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name,
        email,
        language: "en",
        country: "",
        stage: "",
        interests: [],
        skills: [],
        field: "",
        careerGoal: "",
        onboardingComplete: false,
        createdAt: serverTimestamp(),
      });
      await signOut(auth);
      setVerificationSent(true);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  }

  if (verificationSent) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-12 h-12 bg-[#1a1830] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                stroke="#7F77DD"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-white text-xl font-medium mb-2">{t(lang, "auth.checkEmail")}</h2>
          <p className="text-[#888780] text-sm leading-relaxed mb-2">
            {t(lang, "auth.verificationSent")}{" "}
            <span className="text-white">{email}</span>.
          </p>
          <p className="text-[#888780] text-sm leading-relaxed mb-8">
            {t(lang, "auth.clickLink")}
          </p>
          <button
            onClick={() => {
              document.cookie = "__session=; path=/; max-age=0";
              window.location.href = "/login";
            }}
            className="inline-block bg-[#534AB7] hover:bg-[#4840a0] text-white rounded-lg px-8 py-2.5 text-sm font-medium transition"
          >
            {t(lang, "auth.goToSignIn")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080a0f] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border border-white/10">

        {/* Left panel */}
        <div className="hidden md:flex bg-[#0f1117] p-10 flex-col justify-between min-h-[560px]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#7F77DD] rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 14 L9 4 L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 10.5 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-white font-medium text-base tracking-tight">PathForge</span>
          </div>
          <div>
            <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-3">
              {lang === "fr" ? "Votre avenir commence ici" : "Your future starts here"}
            </p>
            <h1 className="text-white text-2xl font-medium leading-snug tracking-tight mb-4">
              {lang === "fr" ? "Découvrez votre voie." : "Discover your path."}<br />
              {lang === "fr" ? "Construisez votre avenir." : "Build your future."}
            </h1>
            <p className="text-[#888780] text-sm leading-relaxed">
              {lang === "fr"
                ? "Orientation professionnelle propulsée par l'IA pour les étudiants du monde entier."
                : "AI-powered career guidance for students and graduates worldwide. From secondary school to your first job and beyond."
              }
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {(lang === "fr"
                ? ["Lycée", "Étudiants", "Diplômés", "Anglais + Français"]
                : ["Secondary school", "Undergraduates", "Graduates", "English + French"]
              ).map((tag) => (
                <span key={tag} className="text-[11px] px-3 py-1 rounded-full border border-[#2C2C2A] text-[#B4B2A9]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <p className="text-[#444441] text-xs">
            {lang === "fr" ? "Utilisé par des étudiants à travers l'Afrique et au-delà" : "Trusted by students across Africa and beyond"}
          </p>
        </div>

        {/* Right panel */}
        <div className="bg-white p-8 md:p-10 flex flex-col justify-center">

          {/* Back to landing */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition text-xs mb-6 w-fit"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5m0 0l7 7m-7-7l7-7"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t(lang, "auth.backToHome")}
          </Link>

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 md:hidden">
            <div className="w-7 h-7 bg-[#7F77DD] rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M4 14 L9 4 L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 10.5 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-gray-900 font-medium text-sm">PathForge</span>
          </div>

          <h2 className="text-xl font-medium text-gray-900 mb-1">{t(lang, "auth.signUp")}</h2>
          <p className="text-sm text-gray-500 mb-7">
            {lang === "fr"
              ? "Rejoignez des milliers d'étudiants qui construisent leur avenir"
              : "Join thousands of students building their future"
            }
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-gray-400 tracking-wider uppercase mb-1.5">
                {t(lang, "auth.fullName")}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === "fr" ? "Votre nom complet" : "Your full name"}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#7F77DD] focus:ring-2 focus:ring-[#EEEDFE] transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-400 tracking-wider uppercase mb-1.5">
                {t(lang, "auth.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#7F77DD] focus:ring-2 focus:ring-[#EEEDFE] transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-400 tracking-wider uppercase mb-1.5">
                {t(lang, "auth.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === "fr" ? "Min. 6 caractères" : "Min. 6 characters"}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#7F77DD] focus:ring-2 focus:ring-[#EEEDFE] transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#534AB7] hover:bg-[#4840a0] text-white rounded-lg py-3 text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? t(lang, "auth.saving") : t(lang, "auth.signUp")}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            {t(lang, "auth.hasAccount")}{" "}
            <button
              onClick={() => {
                document.cookie = "__session=; path=/; max-age=0";
                window.location.href = "/login";
              }}
              className="text-[#534AB7] hover:underline"
            >
              {t(lang, "auth.signIn")}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
