'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StorageAPI } from '@/lib/storage';
import { PracticeSession, DashboardStats } from '@/lib/types';
import { formatDuration, formatDurationHuman, formatDate } from '@/lib/utils';
import {
  TrendingUp,
  Award,
  Clock,
  Target,
  Play,
  BarChart3,
  PieChart as PieIcon,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function ProgressPage() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    totalPracticeTimeSeconds: 0,
    avgDurationSeconds: 0,
    avgScore: null,
    scoreImprovement: null,
    durationPacingRate: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    StorageAPI.getSessions().then(setSessions);
    StorageAPI.getDashboardStats().then(setStats);
  }, []);

  // Category breakdown for Pie Chart
  const categoryCount: Record<string, number> = {};
  sessions.forEach((s) => {
    const cat = s.category || 'Custom';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const pieData = Object.entries(categoryCount).map(([name, value]) => ({
    name,
    value,
  }));
  const PIE_COLORS = ['#4f46e5', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  // Score progression
  const scoreData = [...sessions]
    .reverse()
    .map((s) => ({
      title: s.pitch_title.length > 12 ? s.pitch_title.substring(0, 12) + '…' : s.pitch_title,
      score: s.feedback?.overall_score ?? null,
      clarity: s.feedback?.category_scores?.clarity ?? null,
      persuasiveness: s.feedback?.category_scores?.persuasiveness ?? null,
    }))
    .filter((d) => d.score !== null);

  // Pacing breakdown
  const onTargetCount = sessions.filter((s) => Math.abs(s.actual_duration_seconds - s.target_duration_seconds) <= 3).length;
  const overTimeCount = sessions.filter((s) => s.actual_duration_seconds > s.target_duration_seconds + 3).length;
  const underTimeCount = sessions.filter((s) => s.actual_duration_seconds < s.target_duration_seconds - 3).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              Progress & Speaking Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Longitudinal tracking of delivery pacing, score improvements, and pitch categories.
            </p>
          </div>

          <Link href="/practice">
            <Button variant="primary" size="md" icon={<Play className="w-4 h-4 fill-current" />}>
              Practice Now
            </Button>
          </Link>
        </div>

        {/* High-level performance cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Total Matched Pacing</p>
                <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">
                  {stats.durationPacingRate}%
                </div>
                <p className="text-[11px] text-slate-400">Pitches within ±10% target</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Mean Evaluated Score</p>
                <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">
                  {stats.avgScore !== null ? `${stats.avgScore}/100` : '—'}
                </div>
                <p className="text-[11px] text-slate-400">Evaluated across all sessions</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Practice Volume</p>
                <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">
                  {stats.totalSessions} Sessions
                </div>
                <p className="text-[11px] text-slate-400">Total: {formatDurationHuman(stats.totalPracticeTimeSeconds)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        {mounted && sessions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Score Progression (8 cols) */}
            <div className="lg:col-span-8">
              <Card className="shadow-sm border-slate-200 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" /> Multi-Dimension Score Trajectory
                  </CardTitle>
                  <CardDescription>
                    Tracking Clarity, Persuasiveness, and Overall Score over time.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2">
                  {scoreData.length > 0 ? (
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="title" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                          <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              fontSize: '12px',
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                          <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} name="Overall Score" activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="clarity" stroke="#10b981" strokeWidth={2} name="Clarity" strokeDasharray="4 4" />
                          <Line type="monotone" dataKey="persuasiveness" stroke="#f59e0b" strokeWidth={2} name="Persuasiveness" strokeDasharray="2 2" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-72 flex items-center justify-center text-xs text-slate-400">
                      Evaluate sessions with AI to view dimension trends.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown (4 cols) */}
            <div className="lg:col-span-4">
              <Card className="shadow-sm border-slate-200 h-full flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-purple-600" /> Category Breakdown
                  </CardTitle>
                  <CardDescription>Distribution of practiced pitch styles.</CardDescription>
                </CardHeader>

                <CardContent className="pt-2 flex-1 flex flex-col justify-center">
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          innerRadius={45}
                          paddingAngle={3}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-3 flex flex-wrap justify-center gap-2 text-[11px]">
                    {pieData.map((d, i) => (
                      <span key={d.name} className="flex items-center gap-1 text-slate-600">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        {d.name} ({d.value})
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="p-12 text-center text-slate-500 border-dashed border-slate-300">
            <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Historical Analytics</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Complete practice sessions to visualize your long-term communication trajectory.
            </p>
            <Link href="/practice">
              <Button variant="primary" size="sm">
                Start Practice Timer
              </Button>
            </Link>
          </Card>
        )}

        {/* Pacing Distribution Summary */}
        <Card className="p-6 border-slate-200">
          <CardTitle className="text-base mb-4">Pacing Rhythm Distribution</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl">
              <span className="text-xs font-bold uppercase text-emerald-800">On Target (±3s)</span>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">{onTargetCount}</div>
              <p className="text-[11px] text-emerald-600 mt-0.5">Ideal delivery window</p>
            </div>

            <div className="p-4 bg-rose-50/70 border border-rose-100 rounded-xl">
              <span className="text-xs font-bold uppercase text-rose-800">Over Target</span>
              <div className="text-2xl font-bold font-mono text-rose-700 mt-1">{overTimeCount}</div>
              <p className="text-[11px] text-rose-600 mt-0.5">Exceeded target time</p>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-xl">
              <span className="text-xs font-bold uppercase text-amber-800">Under Target</span>
              <div className="text-2xl font-bold font-mono text-amber-700 mt-1">{underTimeCount}</div>
              <p className="text-[11px] text-amber-600 mt-0.5">Finished ahead of goal</p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
