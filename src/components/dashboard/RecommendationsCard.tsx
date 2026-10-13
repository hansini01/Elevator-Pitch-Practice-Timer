'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AIRecommendations, PracticeSession } from '@/lib/types';
import {
  Sparkles,
  Target,
  Clock,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface RecommendationsCardProps {
  sessions: PracticeSession[];
}

export const RecommendationsCard: React.FC<RecommendationsCardProps> = ({ sessions }) => {
  const [recommendations, setRecommendations] = useState<AIRecommendations | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions }),
      });
      const json = await res.json();
      if (json && json.data) {
        setRecommendations(json.data);
      }
    } catch (err) {
      console.error('Failed to load AI recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [sessions.length]);

  if (!recommendations && isLoading) {
    return (
      <Card className="p-6 border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-indigo-600 animate-spin" />
          <h4 className="text-sm font-semibold text-slate-800">Analyzing Performance Trends with AI...</h4>
        </div>
        <div className="h-16 bg-slate-100 rounded-lg animate-pulse" />
      </Card>
    );
  }

  if (!recommendations) return null;

  return (
    <Card className="border-indigo-100 shadow-sm overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/30">
      <CardHeader className="pb-3 border-b border-indigo-50 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-100/70 text-indigo-700 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base text-slate-900">AI Practice Coach Insights</CardTitle>
            <CardDescription className="text-xs">
              Personalized guidance derived from your practice sessions.
            </CardDescription>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchRecommendations}
          disabled={isLoading}
          className="text-xs text-indigo-600 hover:text-indigo-700"
          title="Refresh AI Insights"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Focus Area Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-indigo-50/70 rounded-xl border border-indigo-100">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-xs font-semibold text-slate-700">Recommended Focus Area:</span>
            <span className="text-xs font-bold text-indigo-900">{recommendations.focus_area}</span>
          </div>
          <Badge variant="purple" size="sm">
            Priority Action
          </Badge>
        </div>

        {/* Pacing Insight */}
        <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-600">
          <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800">Timing & Pacing Rhythm: </strong>
            {recommendations.pacing_insight}
          </div>
        </div>

        {/* Next Goal */}
        <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-600">
          <Lightbulb className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800">Suggested Next Practice Goal: </strong>
            {recommendations.next_session_goal}
          </div>
        </div>

        {/* Key Weaknesses / Focus Checklist */}
        {recommendations.key_weaknesses && recommendations.key_weaknesses.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Techniques to Refine
            </span>
            <ul className="space-y-1.5">
              {recommendations.key_weaknesses.map((weakness, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Encouragement footer */}
        {recommendations.encouragement && (
          <div className="text-xs italic text-slate-500 pt-1 border-t border-slate-100">
            "{recommendations.encouragement}"
          </div>
        )}
      </CardContent>
    </Card>
  );
};
