'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { Charts } from '@/components/dashboard/Charts';
import { RecentSessions } from '@/components/dashboard/RecentSessions';
import { RecommendationsCard } from '@/components/dashboard/RecommendationsCard';
import { MilestoneChecklist } from '@/components/dashboard/MilestoneChecklist';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StorageAPI } from '@/lib/storage';
import { PracticeSession, DashboardStats, UserProfile } from '@/lib/types';
import {
  Play,
  Sparkles,
  RefreshCw,
  Plus,
  ArrowRight,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    totalPracticeTimeSeconds: 0,
    avgDurationSeconds: 0,
    avgScore: null,
    scoreImprovement: null,
    durationPacingRate: 0,
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allSessions, allStats, userProf] = await Promise.all([
        StorageAPI.getSessions(),
        StorageAPI.getDashboardStats(),
        StorageAPI.getProfile(),
      ]);
      setSessions(allSessions);
      setStats(allStats);
      setProfile(userProf);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* WELCOME SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl text-white shadow-xl shadow-indigo-950/10 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="purple" size="sm" className="bg-white/10 text-indigo-200 border-white/20">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Continuous Practice
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile?.display_name || 'Alex'}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-xl leading-relaxed">
              "Great pitches are never improvised by chance; they are forged in deliberate timing." Ready to calibrate your next delivery?
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/practice">
              <Button
                size="lg"
                variant="primary"
                className="bg-white text-indigo-900 hover:bg-slate-100 shadow-lg shadow-black/20 font-bold"
                icon={<Play className="w-4 h-4 fill-current text-indigo-600" />}
              >
                Start New Practice
              </Button>
            </Link>

            <Link href="/generator">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-semibold"
                icon={<Sparkles className="w-4 h-4 text-indigo-300" />}
              >
                Draft with AI
              </Button>
            </Link>
          </div>
        </div>

        {/* STATISTICS CARDS */}
        <StatsCards stats={stats} />

        {/* RECHARTS PROGRESS VISUALIZATIONS */}
        <Charts sessions={sessions} />

        {/* RECENT SESSIONS TABLE & ACTIONS */}
        <RecentSessions sessions={sessions} onSessionDeleted={loadData} />

        {/* AI PRACTICE RECOMMENDATIONS */}
        <RecommendationsCard sessions={sessions} />

        {/* ASSIGNMENT 5-MILESTONE CHECKLIST */}
        <MilestoneChecklist />
      </div>
    </AppLayout>
  );
}
