'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StorageAPI } from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { UserProfile } from '@/lib/types';
import {
  Settings as SettingsIcon,
  User,
  Clock,
  Volume2,
  Database,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Info,
} from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({
    id: 'user-default',
    display_name: 'Alex Morgan',
    email: 'alex.morgan@pitchperfect.ai',
    preferred_duration_seconds: 60,
    preferred_wpm: 140,
    sound_enabled: true,
  });

  const [isCloud, setIsCloud] = useState<boolean>(false);
  const [isGeminiLive, setIsGeminiLive] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);

  useEffect(() => {
    setIsCloud(isSupabaseConfigured());
    StorageAPI.getProfile().then(setProfile);

    // Check Gemini API live status
    fetch('/api/generate-pitch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        purpose: 'status-check',
        target_audience: 'check',
        topic: 'check',
        tone: 'Professional',
        target_duration_seconds: 30,
      }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res && res.isLiveGemini) {
          setIsGeminiLive(true);
        }
      })
      .catch(() => setIsGeminiLive(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await StorageAPI.saveProfile(profile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDemoData = () => {
    if (confirm('Restore sample pitches and practice session data?')) {
      StorageAPI.resetToDemoData();
      alert('Sample pitch data restored successfully!');
      window.location.reload();
    }
  };

  const handleClearAllData = () => {
    if (confirm('Clear all local practice sessions and custom pitches?')) {
      StorageAPI.clearAllData();
      alert('All local records cleared.');
      window.location.reload();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-indigo-600" />
            Application Settings & Status
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal speaking preferences and inspect backend integrations.
          </p>
        </div>

        {/* 1. USER PROFILE & PREFERENCES FORM */}
        <form onSubmit={handleSaveProfile}>
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" /> Speaking Preferences & Profile
              </CardTitle>
              <CardDescription>
                Customize your display name and default practice calibration settings.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Display Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profile.display_name}
                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Default Duration */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Practice Target Duration
                  </label>
                  <select
                    value={profile.preferred_duration_seconds}
                    onChange={(e) =>
                      setProfile({ ...profile, preferred_duration_seconds: Number(e.target.value) })
                    }
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 bg-white"
                  >
                    <option value="30">30 Seconds (Quick Elevator)</option>
                    <option value="45">45 Seconds (Executive Intro)</option>
                    <option value="60">60 Seconds (Standard Pitch)</option>
                    <option value="90">90 Seconds (Deep Pitch)</option>
                  </select>
                </div>

                {/* Preferred Speaking Rate WPM */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assumed Speaking Rate (Words Per Minute)
                  </label>
                  <select
                    value={profile.preferred_wpm}
                    onChange={(e) =>
                      setProfile({ ...profile, preferred_wpm: Number(e.target.value) })
                    }
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 bg-white"
                  >
                    <option value="120">120 WPM (Deliberate / Slow Pace)</option>
                    <option value="140">140 WPM (Conversational Standard)</option>
                    <option value="160">160 WPM (Brisk / High Energy)</option>
                  </select>
                </div>
              </div>

              {/* Sound Notifications Toggle */}
              <div className="pt-2 flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">
                      Timer Audio Chimes
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Play synthesized harmonic bell chimes at 10s remaining and at 0s.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={profile.sound_enabled}
                  onChange={(e) => setProfile({ ...profile, sound_enabled: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-1.5 font-semibold">
                  <Check className="w-4 h-4" /> Preferences updated successfully!
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-end p-4 border-t border-slate-100">
              <Button type="submit" variant="primary" size="md">
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </form>

        {/* 2. SYSTEM INTEGRATIONS STATUS */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Backend Integrations Status
          </h2>

          {/* Supabase Status Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-indigo-600" />
                <div>
                  <CardTitle className="text-base">Supabase Database & Auth</CardTitle>
                  <CardDescription className="text-xs">
                    Cloud database persistence and Row-Level Security.
                  </CardDescription>
                </div>
              </div>

              <Badge variant={isCloud ? 'success' : 'slate'} size="md">
                {isCloud ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Supabase Live
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" /> Local Preview Mode
                  </>
                )}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3 pt-0 text-xs text-slate-600 leading-relaxed">
              {isCloud ? (
                <p className="text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  Supabase is active! Pitches, sessions, and AI feedback are synced directly with your Supabase Postgres database.
                </p>
              ) : (
                <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p>
                    The app is currently running in <strong>Local Preview Mode</strong>. All features (timer, pitch library, analytics, session scoring) function smoothly using offline storage.
                  </p>
                  <p>
                    To connect your live Supabase cloud database, configure these variables in <code className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-800">.env.local</code>:
                  </p>
                  <pre className="p-3 bg-slate-900 text-indigo-200 rounded-lg text-[11px] overflow-x-auto font-mono">
                    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co{'\n'}
                    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
                  </pre>
                  <p className="text-[11px] text-slate-500">
                    SQL schema is pre-written at <code className="px-1 py-0.5 bg-slate-200 rounded">supabase/schema.sql</code> including RLS security policies.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gemini AI Status Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <div>
                  <CardTitle className="text-base">Google Gemini AI Engine</CardTitle>
                  <CardDescription className="text-xs">
                    Pitch generation, 7-dimension evaluation, and coaching recommendations.
                  </CardDescription>
                </div>
              </div>

              <Badge variant={isGeminiLive ? 'success' : 'slate'} size="md">
                {isGeminiLive ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Gemini Live
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" /> Intelligent Heuristic Mode
                  </>
                )}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3 pt-0 text-xs text-slate-600 leading-relaxed">
              {isGeminiLive ? (
                <p className="text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  Google Gemini 1.5 Flash API is active! Elevator pitches and session evaluations are processed through Google's Gen AI models.
                </p>
              ) : (
                <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p>
                    Currently operating in <strong>Intelligent Heuristic Mode</strong>. AI generation and scoring produce high-quality structured feedback even without an external API key!
                  </p>
                  <p>
                    To activate live Gemini models, obtain a free API key from{' '}
                    <a
                      href="https://aistudio.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      Google AI Studio
                    </a>{' '}
                    and add to <code className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-800">.env.local</code>:
                  </p>
                  <pre className="p-3 bg-slate-900 text-indigo-200 rounded-lg text-[11px] overflow-x-auto font-mono">
                    GEMINI_API_KEY=AIzaSy...{'\n'}
                    GEMINI_MODEL=gemini-1.5-flash
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 3. DEMO DATA MANAGEMENT */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Workshop & Demo Data Controls</CardTitle>
            <CardDescription className="text-xs">
              Quickly reset or clear stored sessions for live presentation rehearsals.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={handleResetDemoData} icon={<RotateCcw className="w-4 h-4" />}>
              Restore Sample Pitches & History
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAllData} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50" icon={<Trash2 className="w-4 h-4" />}>
              Clear All Stored Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
