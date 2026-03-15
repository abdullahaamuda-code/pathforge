"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        url: "https://pathforge-inky.vercel.app/login",
      });
      setSent(true);
    } catch (err) {
      setError("No account found with that email address.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-12 h-12 bg-[#1a1830] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-white text-xl font-medium mb-2">Check your email</h2>
          <p className="text-[#888780] text-sm leading-relaxed mb-2">
            We sent a password reset link to{" "}
            <span className="text-white">{email}</span>.
          </p>
          <p className="text-[#888780] text-sm leading-relaxed mb-8">
            Click the link to reset your password then sign in.
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#534AB7] hover:bg-[#4840a0] text-white rounded-lg px-8 py-2.5 text-sm font-medium transition"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-[#888780] hover:text-white transition text-xs mb-8 w-fit"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5m0 0l7 7m-7-7l7-7"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to sign in
        </Link>

        <div className="bg-[#0f1117] border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-7 h-7 bg-[#7F77DD] rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M4 14 L9 4 L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 10.5 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-white font-medium text-sm">PathForge</span>
          </div>

          <h2 className="text-white text-xl font-medium mb-2">Reset your password</h2>
          <p className="text-[#888780] text-sm mb-8">
            Enter your email and we'll send you a reset link.
          </p>

          {error && (
            <div className="bg-red-900/20 border border-red-800/40 text-red-400 text-xs rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-[#888780] tracking-wider uppercase mb-1.5">
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
                className="w-full bg-[#080a0f] border border-[#2C2C2A] rounded-lg px-4 py-3 text-sm text-white placeholder-[#444441] focus:outline-none focus:border-[#7F77DD] focus:ring-2 focus:ring-[#7F77DD]/20 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#534AB7] hover:bg-[#4840a0] text-white rounded-lg py-3 text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
