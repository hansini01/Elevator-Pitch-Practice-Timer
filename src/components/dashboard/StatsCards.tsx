import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { DashboardStats } from '@/lib/types';
import { formatDurationHuman } from '@/lib/utils';
import {
  Clock,
  Award,
  TrendingUp,
  Activity,
  Target,
  Sparkles,
} from 'lucide-react';

interface StatsCardsProps {
  stats: DashboardStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Sessions */}
      <Card className="hover:shadow-md transition-shadow border-slate-200/90">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Sessions
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {stats.totalSessions}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Practiced elevator pitches</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* Total Practice Time */}
      <Card className="hover:shadow-md transition-shadow border-slate-200/90">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Practice Time
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {formatDurationHuman(stats.totalPracticeTimeSeconds)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Avg {formatDurationHuman(stats.avgDurationSeconds)} / pitch
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* Average AI Score */}
      <Card className="hover:shadow-md transition-shadow border-slate-200/90">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Avg AI Score
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold text-slate-900 font-mono">
                {stats.avgScore !== null ? `${stats.avgScore}/100` : '—'}
              </h3>
              {stats.scoreImprovement !== null && (
                <span
                  className={`text-xs font-semibold flex items-center gap-0.5 ${
                    stats.scoreImprovement >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  <TrendingUp className="w-3 h-3" />
                  {stats.scoreImprovement >= 0 ? `+${stats.scoreImprovement}%` : `${stats.scoreImprovement}%`}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Evaluated by Gemini AI</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* Target Pacing Rate */}
      <Card className="hover:shadow-md transition-shadow border-slate-200/90">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pacing Adherence
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {stats.totalSessions > 0 ? `${stats.durationPacingRate}%` : '—'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Within ±10% target limit</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
