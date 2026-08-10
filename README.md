# 🛤️ PathForge

**Discover your path. Build your future.**

PathForge helps you turn "I want to become a ___" into an actual plan. Pick a role or field, and PathForge generates a clear roadmap — the skills, milestones, and courses to get there — powered by AI and backed by real course data.

**Live:** [pathforge-app.vercel.app](https://pathforge-app.vercel.app) · **Repo:** [github.com/abdullahaamuda-code/pathforge](https://github.com/abdullahaamuda-code/pathforge)

---

## How it works

1. **Pick a role or field** — e.g. Frontend Developer, Data Analyst, Product Designer
2. **Get a generated roadmap** — an ordered path of skills and milestones for that role, powered by Groq
3. **Follow it with real course data** — pulled in via PathForge's own scraping pipeline, not generic links

---

## Features

- **AI-generated roadmaps** — pick a role, get a structured path forward, powered by the Groq SDK
- **Real course data** — a custom scraping module keeps course recommendations grounded in what's actually available, not guesses
- **Accounts & saved progress** — Firebase handles auth and real-time data, so a roadmap persists across sessions
- **Multi-language support** — internationalization built in (e.g. French)
- **Modern frontend** — Next.js 16 App Router for fast, responsive navigation

## Tech Stack

| | |
|---|---|
| Language | TypeScript |
| Framework | Next.js 16 (App Router) |
| Database/Auth | Firebase |
| AI | Groq SDK |
| Styling | Tailwind CSS |

## Status

| Area | Status |
|---|---|
| Next.js frontend | ✅ Functional |
| Firebase integration | ✅ Functional |
| AI (Groq) roadmap generation | ✅ Functional |
| Web scraping (course data) | ✅ Implemented |
| Internationalization | ✅ Started |
| CI/CD | ✅ GitHub Actions configured |

---

## Local Setup

**1. Clone the repository**

```bash
git clone https://github.com/abdullahaamuda-code/pathforge.git
cd pathforge
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env.local` with your Firebase and Groq credentials, then run:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

---

Built with ❤️ by Abdullah A-Amuda
