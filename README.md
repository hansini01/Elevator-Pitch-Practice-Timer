<<<<<<< HEAD
# PitchPerfect AI — Elevator Pitch Practice Timer

> **Practice smarter. Speak confidently. Make every second count.**

PitchPerfect AI is a modern, responsive, full-stack web application designed for students, job applicants, and startup founders to practice elevator pitches, calibrate their speaking duration with millisecond accuracy, receive structured AI-powered evaluations via Google Gemini, and track continuous communication improvement.

---

## 🌟 Key Features

1. **High-Accuracy Practice Timer**
   - Timestamp-delta elapsed/remaining tracking (`Date.now()` animation frame loop) that never drifts when tabs are hidden or inactive.
   - Circular SVG progress meter with visual alert transitions (amber warning at 10s, red pulsing overtime badge).
   - Distraction-free teleprompter script reader with adjustable font sizes.
   - Built-in Web Audio API synthesized bell chimes (no external audio assets required; works offline).
   - Full keyboard shortcuts (`Space` to start/pause, `R` to reset, `F` to finish).

2. **AI Pitch Coach (Google Gemini AI)**
   - **Pitch Generator:** Generates duration-calibrated pitches tailored to purpose, audience, and tone, calculating realistic speaking time from word count at 140 WPM.
   - **7-Dimension Pitch Analysis:** Evaluates message clarity, structure, conciseness, audience relevance, persuasiveness, opening hook, and closing call-to-action with actionable drills and a refined version.
   - **Coaching Recommendations:** Synthesizes historical scores to deliver personalized goals and identify repeated weaknesses.

3. **Dashboard & Performance Analytics (Recharts)**
   - Live aggregated metrics: total sessions, practice time, average score, pacing adherence.
   - AI score progression area chart and Target vs Actual duration comparison bars.
   - Category distribution breakdown (Job Interview, Startup, Networking, etc.).

4. **Persistence & Database (Supabase + Local Preview)**
   - Multi-tenant architecture with Row-Level Security (RLS) policies.
   - Automatic local preview fallback so you can test all features immediately without setup blocks.

5. **Reporting & Exports**
   - RFC-4180 compliant CSV export for complete practice history.
   - Print-friendly, PDF-ready session evaluation reports formatted for physical paper or digital PDF saving.

---

## 🛠 Technology Stack

- **Framework:** Next.js 14 (App Router, Server Actions & API Routes)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS with CSS variables
- **Icons:** Lucide React
- **Database & Auth:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **AI Integration:** Google Gemini API (`@google/generative-ai`)
- **Visualizations:** Recharts
- **Audio:** Web Audio API Native Synthesizer

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
Ensure you have **Node.js 18+** installed.

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/your-username/pitchperfect-ai.git
cd pitchperfect-ai
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Populate the following variables:
```ini
# Supabase Database & Auth (Optional for local preview mode)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google Gemini API (Get key free at https://aistudio.google.com/)
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-1.5-flash
```

> **Note on Preview Mode:** If Supabase keys are not provided, PitchPerfect AI runs in **Local Preview Mode** using browser storage with realistic demo pitches pre-seeded.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄 Supabase Schema Setup

If connecting to Supabase:
1. Log into your [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor** -> **New Query**.
3. Copy and run the entire SQL script from `supabase/schema.sql`.
4. It will create the four tables (`profiles`, `pitches`, `practice_sessions`, `pitch_feedback`), indexes, triggers, and Row Level Security (RLS) policies.

---

## 🚢 Deployment to Vercel

PitchPerfect AI is deployment-ready for Vercel:

1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (e.g. `gemini-1.5-flash`)
5. Click **Deploy**. Vercel will automatically compile the Next.js production build.

---

## 📋 Milestone Verification Checklist

- [x] **Milestone 1:** Understand requirements and architecture.
- [x] **Milestone 2:** Set up Next.js App Router, Tailwind design system, and precision timer.
- [x] **Milestone 3:** Connect Supabase database schema and RLS policies (with seamless local fallback).
- [x] **Milestone 4:** Integrate Google Gemini AI SDK for pitch generation, evaluation, and recommendations.
- [x] **Milestone 5:** Production build verification, CSV export, printable PDF report, and Vercel readiness.

---

## 📄 License
MIT License. Built for elevator pitch mastery.
=======
# Elevator-Pitch-Practice-Timer
>>>>>>> aaeb79414fd5b038c58ae94eafa7567b5e662960
