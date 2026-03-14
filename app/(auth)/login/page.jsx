"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Show success message if redirected from email verification
    if (searchParams.get("verified") === "true") {
      setVerified(true);
    }
  }, [searchParams]);

  async function handleLogin(e) {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      if (!result.user.emailVerified) {
        setError("Please verify your email before signing in. Check your inbox.");
        setLoading(false);
        return;
      }

      const userSnap = await getDoc(doc(db, "users", result.user.uid));
      const data = userSnap.data();
      const destination = data?.onboardingComplete ? "/dashboard" : "/onboarding";
      await new Promise((resolve) => setTimeout(resolve, 500));
      window.location.href = destination;
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080a0f] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border border-white/10">

        {/* Left panel */}
        <div className="hidden md:flex bg-[#0f1117] p-10 flex-col justify-between min-h-[520px]">
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
            <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-3">Welcome back</p>
            <h1 className="text-white text-2xl font-medium leading-snug tracking-tight mb-4">
              Your path is<br />waiting for you.
            </h1>
            <p className="text-[#888780] text-sm leading-relaxed">
              Sign in to continue building your personalized career roadmap and discover opportunities matched to your profile.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {["Personalized roadmap", "AI mentor", "Opportunity matching", "Gap analysis"].map((tag) => (
                <span key={tag} className="text-[11px] px-3 py-1 rounded-full border border-[#2C2C2A] text-[#B4B2A9]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <p className="text-[#444441] text-xs">Trusted by students across Africa and beyond</p>
        </div>

        {/* Right panel */}
        <div className="bg-white p-8 md:p-10 flex flex-col justify-center">

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

          <h2 className="text-xl font-medium text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-6">Sign in to continue your journey</p>

          {/* Verification success banner */}
          {verified && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Email verified successfully. You can now sign in.
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-xs rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-gray-400 tracking-wider uppercase mb-1.5">
                Email
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
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#7F77DD] focus:ring-2 focus:ring-[#EEEDFE] transition"
              />
            </div>
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-[#534AB7] hover:underline">
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#534AB7] hover:bg-[#4840a0] text-white rounded-lg py-3 text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#534AB7] hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}