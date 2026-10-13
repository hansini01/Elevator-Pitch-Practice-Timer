'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PitchFeedback, PracticeSession } from '@/lib/types';
import { formatDuration, formatDurationHuman } from '@/lib/utils';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Copy,
  Check,
  Printer,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface FeedbackReportProps {
  session: PracticeSession;
  feedback: PitchFeedback;
  onPrint?: () => void;
}

export const FeedbackReport: React.FC<FeedbackReportProps> = ({
  session,
  feedback,
  onPrint,
}) => {
  const [copiedRefined, setCopiedRefined] = useState(false);
  const [copiedHook, setCopiedHook] = useState(false);
  const [copiedClosing, setCopiedClosing] = useState(false);

  const handleCopyText = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-indigo-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 80) return 'bg-indigo-600';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const categoryLabels: Record<string, string> = {
    clarity: 'Message Clarity',
    structure: 'Structure & Flow',
    conciseness: 'Word Economy & Conciseness',
    audience_relevance: 'Audience Relevance',
    persuasiveness: 'Persuasiveness & Value Hook',
    hook_strength: 'Opening Hook Strength',
    closing_strength: 'Closing Call-to-Action',
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner: Genuine disclosure about text-based evaluation */}
      <div className="p-3.5 bg-slate-100/80 rounded-xl border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-800">Methodology Notice: </strong>
          PitchPerfect AI evaluates textual structure, hook power, pacing metrics, and language conciseness. It does not measure physical vocal acoustics, accent, or body language.
        </div>
      </div>

      {/* Score Overview Card */}
      <Card className="border-indigo-100 shadow-sm overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Overall Score Badge */}
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-100 shrink-0">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono leading-none">
                  {feedback.overall_score}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200 mt-1">
                  Out of 100
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {feedback.overall_score >= 90
                      ? 'Outstanding Delivery!'
                      : feedback.overall_score >= 80
                      ? 'Strong, Impactful Pitch'
                      : feedback.overall_score >= 70
                      ? 'Solid Foundation'
                      : 'Needs Refinement'}
                  </h3>
                  <Badge variant="purple" size="sm">
                    Gemini AI Evaluated
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                  Practice completed in {session.actual_duration_seconds}s (Target: {session.target_duration_seconds}s). Timing variance: {session.actual_duration_seconds - session.target_duration_seconds >= 0 ? `+${session.actual_duration_seconds - session.target_duration_seconds}s` : `${session.actual_duration_seconds - session.target_duration_seconds}s`}.
                </p>
              </div>
            </div>

            {/* Actions: Print Report */}
            {onPrint && (
              <div className="shrink-0">
                <Button variant="outline" size="sm" onClick={onPrint} icon={<Printer className="w-4 h-4" />}>
                  Print / Save PDF Report
                </Button>
              </div>
            )}
          </div>

          {/* Category Scores Grid */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(feedback.category_scores || {}).map(([key, score]) => (
              <div key={key} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">
                    {categoryLabels[key] || key}
                  </span>
                  <span className={`font-mono font-bold ${getScoreColor(score)}`}>
                    {score}/100
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${getScoreBg(score)} transition-all duration-500`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Improvements Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="border-emerald-100/80 shadow-sm">
          <CardHeader className="bg-emerald-50/50 p-4 sm:p-5 pb-3 border-b border-emerald-100/60">
            <CardTitle className="text-sm sm:text-base text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-2.5">
            {feedback.strengths.map((s, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{s}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card className="border-amber-100/80 shadow-sm">
          <CardHeader className="bg-amber-50/50 p-4 sm:p-5 pb-3 border-b border-amber-100/60">
            <CardTitle className="text-sm sm:text-base text-amber-950 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" /> Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-2.5">
            {feedback.improvements.map((imp, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{imp}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Actionable Recommendations */}
      {feedback.recommendations && feedback.recommendations.length > 0 && (
        <Card className="border-indigo-100/80 shadow-sm">
          <CardHeader className="bg-indigo-50/50 p-4 sm:p-5 pb-3 border-b border-indigo-100/60">
            <CardTitle className="text-sm sm:text-base text-indigo-950 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-indigo-600" /> Actionable Next-Step Drills
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-2.5">
            {feedback.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                <Lightbulb className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Suggested Hook & Suggested Closing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {feedback.hook_suggestion && (
          <Card className="p-4 sm:p-5 shadow-sm border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Suggested Opening Hook
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs px-2 py-0.5"
                onClick={() => handleCopyText(feedback.hook_suggestion, setCopiedHook)}
              >
                {copiedHook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
            <p className="text-xs sm:text-sm italic text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              "{feedback.hook_suggestion}"
            </p>
          </Card>
        )}

        {feedback.closing_suggestion && (
          <Card className="p-4 sm:p-5 shadow-sm border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                Suggested Closing Call-to-Action
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs px-2 py-0.5"
                onClick={() => handleCopyText(feedback.closing_suggestion, setCopiedClosing)}
              >
                {copiedClosing ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
            <p className="text-xs sm:text-sm italic text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              "{feedback.closing_suggestion}"
            </p>
          </Card>
        )}
      </div>

      {/* Refined Pitch Version */}
      {feedback.refined_pitch && (
        <Card className="border-indigo-200/80 shadow-md bg-gradient-to-b from-white to-indigo-50/20">
          <CardHeader className="p-4 sm:p-6 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Refined Version of Your Pitch
              </CardTitle>
              <CardDescription className="text-xs">
                Polished for rhythm, impact, and concise spoken delivery.
              </CardDescription>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopyText(feedback.refined_pitch, setCopiedRefined)}
              icon={copiedRefined ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copiedRefined ? 'Copied' : 'Copy Pitch'}
            </Button>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
            <div className="p-4 rounded-xl bg-white border border-indigo-100/80 font-sans text-sm sm:text-base leading-relaxed text-slate-800 shadow-inner">
              {feedback.refined_pitch}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Est. spoken duration: ~{feedback.refined_wpm_duration || session.target_duration_seconds}s at 140 WPM
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
