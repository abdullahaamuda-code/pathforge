"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#080a0f] text-white px-6 py-16 max-w-lg mx-auto">
      <Link href="/" className="text-[#7F77DD] text-xs hover:underline mb-8 block">← Back to PathForge</Link>
      <h1 className="text-2xl font-medium mb-2">Contact us</h1>
      <p className="text-[#888780] text-sm mb-10">Have a question or feedback? We'd love to hear from you.</p>

      {submitted ? (
        <div className="border border-[#7F77DD]/30 bg-[#1a1830] rounded-xl p-6 text-center">
          <p className="text-white font-medium mb-2">Message sent</p>
          <p className="text-[#888780] text-sm">We'll get back to you within 24 hours.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-[#888780] tracking-wider uppercase mb-1.5">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              className="w-full bg-[#0f1117] border border-[#2C2C2A] rounded-lg px-4 py-3 text-sm text-white placeholder-[#444441] focus:outline-none focus:border-[#7F77DD] transition"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#888780] tracking-wider uppercase mb-1.5">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full bg-[#0f1117] border border-[#2C2C2A] rounded-lg px-4 py-3 text-sm text-white placeholder-[#444441] focus:outline-none focus:border-[#7F77DD] transition"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#888780] tracking-wider uppercase mb-1.5">Message</label>
            <textarea
              id="message"
              name="message"
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="What's on your mind?"
              rows={5}
              className="w-full bg-[#0f1117] border border-[#2C2C2A] rounded-lg px-4 py-3 text-sm text-white placeholder-[#444441] focus:outline-none focus:border-[#7F77DD] transition resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#534AB7] hover:bg-[#4840a0] text-white rounded-lg py-3 text-sm font-medium transition"
          >
            Send message
          </button>
        </form>
      )}

      <div className="mt-10 pt-8 border-t border-[#2C2C2A]">
        <p className="text-[#444441] text-xs text-center">Or email us directly at <span className="text-[#888780]">hello@pathforge.app</span></p>
      </div>
    </div>
  );
}