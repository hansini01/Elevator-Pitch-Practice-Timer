'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Timer,
  Sparkles,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Mic,
  Award,
  Layers,
  Shield,
  Clock,
  Play,
  FileText,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Navbar } from '@/components/layout/Navbar';

export default function LandingPage() {
  const [calculatorDuration, setCalculatorDuration] = useState<30 | 60 | 90>(60);

  const wordTargets = {
    30: { words: '70–80 words', pace: 'Brisk & direct', context: 'Fast networking introductions & elevator encounters' },
    60: { words: '140–150 words', pace: 'Natural conversational', context: 'Standard investor pitches & career fair introductions' },
    90: { words: '210–225 words', pace: 'Structured & nuanced', context: 'Comprehensive project demos & interview responses' },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200/70 bg-gradient-to-b from-white via-indigo-50/20 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6 shadow-xs animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Built for Students, Job Seekers & Startup Founders</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-950 tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Practice smarter.{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
              Speak confidently.
            </span>{' '}
            Make every second count.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Master the art of the elevator pitch with a precision practice timer, distraction-free teleprompter, and objective AI-driven coaching powered by Google Gemini.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/practice">
              <Button
                size="lg"
                variant="primary"
                className="w-full sm:w-auto px-8 py-3.5 text-base shadow-xl shadow-indigo-200 font-semibold"
                icon={<Play className="w-5 h-5 fill-current" />}
              >
                Start Practice Timer
              </Button>
            </Link>

            <Link href="/generator">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold"
                icon={<Sparkles className="w-5 h-5 text-indigo-600" />}
              >
                AI Pitch Generator
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto px-6 py-3.5 text-base text-slate-600"
              >
                View Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          {/* Feature highlights bar */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Drift-free timestamp timer
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Google Gemini AI evaluation
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Printable PDF & CSV reports
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Supabase cloud sync
            </span>
          </div>
        </div>
      </section>

      {/* INTERACTIVE PITCH CALCULATOR SECTION */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Badge variant="purple" size="md" className="mb-2">
            Pacing Science
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How Many Words Can You Speak in an Elevator Pitch?
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            The average conversational English rate is 140 words per minute. Select a target duration to see the ideal length for your pitch:
          </p>

          <div className="mt-8 flex justify-center gap-3">
            {([30, 60, 90] as const).map((dur) => (
              <button
                key={dur}
                onClick={() => setCalculatorDuration(dur)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  calculatorDuration === dur
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {dur} Seconds Pitch
              </button>
            ))}
          </div>

          <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 max-w-2xl mx-auto text-left shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">Word Count</span>
                <div className="text-lg font-bold text-slate-900 font-mono">
                  {wordTargets[calculatorDuration].words}
                </div>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">Speaking Cadence</span>
                <div className="text-sm font-semibold text-indigo-700">
                  {wordTargets[calculatorDuration].pace}
                </div>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">Target Duration</span>
                <div className="text-lg font-bold text-slate-900 font-mono">
                  {calculatorDuration}s
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-4 leading-relaxed">
              <strong className="text-slate-800">Best used for: </strong>
              {wordTargets[calculatorDuration].context}.
            </p>
          </div>
        </div>
      </section>

      {/* KEY FEATURES GRID */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <Badge variant="purple" size="md" className="mb-2">
            Everything You Need
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Real Pitch Mastery
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            From spontaneous speaking rehearsals to structured script analysis, PitchPerfect AI gives you full control over your presentation prep.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="hover:shadow-lg transition-all border-slate-200 p-6 sm:p-8">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
              <Timer className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Drift-Free Precision Timer</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Engineered with millisecond timestamp delta tracking. Unlike naive counters, our timer never drifts when switching browser tabs or minimizing windows.
            </p>
          </Card>

          {/* Feature 2 */}
          <Card className="hover:shadow-lg transition-all border-slate-200 p-6 sm:p-8">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Gemini AI Pitch Coach</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Assess 7 critical communication pillars: hook strength, clarity, structure, conciseness, audience fit, persuasiveness, and closing call-to-action.
            </p>
          </Card>

          {/* Feature 3 */}
          <Card className="hover:shadow-lg transition-all border-slate-200 p-6 sm:p-8">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Performance Analytics</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Visualize your score growth over time with interactive Recharts, monitor duration variance, and export comprehensive CSV and printable PDF reports.
            </p>
          </Card>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="mt-auto py-16 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to deliver your best pitch yet?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-lg mx-auto">
            Try a 60-second practice run right now with zero friction.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/practice">
              <Button size="lg" variant="primary" className="px-8 shadow-lg shadow-indigo-900/50">
                Launch Practice Timer
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
