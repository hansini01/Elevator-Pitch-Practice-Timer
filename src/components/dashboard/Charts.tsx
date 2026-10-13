'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { PracticeSession } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { TrendingUp, BarChart2, Activity, Play } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/Button';

interface ChartsProps {
  sessions: PracticeSession[];
}

export const Charts: React.FC<ChartsProps> = ({ sessions }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[300px]">
        <div className="h-72 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-72 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="border-dashed border-slate-300 p-8 sm:p-12 text-center">
        <Activity className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Practice Sessions Yet</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
          As you practice elevator pitches with the timer, your score trends, speaking frequency, and duration accuracy will appear here in real time.
        </p>
        <Link href="/practice">
          <Button variant="primary" icon={<Play className="w-4 h-4 fill-current" />}>
            Start Your First Practice
          </Button>
        </Link>
      </Card>
    );
  }

  // 1. Prepare Score Progression Data (Chronological: oldest to newest)
  const scoreData = [...sessions]
    .reverse()
    .map((s, idx) => ({
      sessionName: s.pitch_title.length > 15 ? s.pitch_title.substring(0, 15) + '…' : s.pitch_title,
      date: new Date(s.completed_at || s.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      score: s.feedback?.overall_score ?? null,
      clarity: s.feedback?.category_scores?.clarity ?? null,
      persuasiveness: s.feedback?.category_scores?.persuasiveness ?? null,
    }))
    .filter((d) => d.score !== null);

  // 2. Prepare Duration Comparison Data
  const durationData = [...sessions].reverse().slice(-10).map((s) => ({
    title: s.pitch_title.length > 12 ? s.pitch_title.substring(0, 12) + '…' : s.pitch_title,
    Target: s.target_duration_seconds,
    Actual: s.actual_duration_seconds,
  }));

  // 3. Prepare Practice Frequency By Day / Category
  const categoryCount: Record<string, number> = {};
  sessions.forEach((s) => {
    const cat = s.category || 'Custom';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCount).map(([name, count]) => ({
    name,
    count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: AI Score Progression */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> AI Score Progression
              </CardTitle>
              <CardDescription>
                Overall feedback score trajectory across evaluated sessions.
              </CardDescription>
            </div>
            {scoreData.length > 0 && (
              <Badge variant="purple" size="sm">
                Latest: {scoreData[scoreData.length - 1].score}/100
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {scoreData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                    name="AI Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Activity className="w-8 h-8 mb-2 text-slate-300" />
              Analyze a completed pitch to see score progression.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart 2: Target Duration vs Actual Duration */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" /> Actual vs Target Duration
              </CardTitle>
              <CardDescription>
                Pacing accuracy in seconds (Goal vs Speaking Time).
              </CardDescription>
            </div>
            <Badge variant="slate" size="sm">
              Last {durationData.length} Runs
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="title" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} unit="s" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Target" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Target (s)" />
                <Bar dataKey="Actual" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Actual (s)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
