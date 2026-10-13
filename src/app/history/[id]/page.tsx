'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FeedbackReport } from '@/components/feedback/FeedbackReport';
import { PrintableSessionReport } from '@/components/feedback/PrintableSessionReport';
import { StorageAPI } from '@/lib/storage';
import { PracticeSession, PitchFeedback } from '@/lib/types';
import { formatDuration, formatDate, countWords, estimateSpeakingDuration } from '@/lib/utils';
import {
  ArrowLeft,
  Sparkles,
  Printer,
  RotateCcw,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
} from 'lucide-react';

export default function SessionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<PracticeSession | null>(null);
  const [feedback, setFeedback] = useState<PitchFeedback | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Editable script text if user practiced spontaneously and wants to enter what they spoke
  const [customScriptText, setCustomScriptText] = useState<string>('');

  const loadSession = async () => {
    setIsLoading(true);
    try {
      const data = await StorageAPI.getSessionById(sessionId);
      if (data) {
        setSession(data);
        if (data.feedback) {
          setFeedback(data.feedback);
        }
        if (data.script_used) {
          setCustomScriptText(data.script_used);
        }
      }
    } catch (err) {
      console.error('Failed to load session details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const handleTriggerAnalysis = async () => {
    if (!session) return;
    const scriptToAnalyze = customScriptText.trim() || session.script_used?.trim() || '';

    if (!scriptToAnalyze || scriptToAnalyze.length < 5) {
      setAnalysisError('Please enter the pitch script or transcript you practiced before requesting AI analysis.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/analyze-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: scriptToAnalyze,
          pitch_title: session.pitch_title,
          category: session.category,
          target_duration_seconds: session.target_duration_seconds,
          actual_duration_seconds: session.actual_duration_seconds,
          session_id: session.id,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to analyze pitch');
      }

      const generatedFeedback: PitchFeedback = {
        ...json.data,
        id: 'fb-' + Date.now(),
        session_id: session.id,
        user_id: session.user_id,
        created_at: new Date().toISOString(),
      };

      // Save feedback to storage
      await StorageAPI.saveFeedback(generatedFeedback);

      // Update local state
      setFeedback(generatedFeedback);
      setSession((prev) => (prev ? { ...prev, feedback: generatedFeedback, status: 'Analyzed' } : null));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setAnalysisError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRepeatPractice = () => {
    if (!session) return;
    const query = new URLSearchParams({
      title: session.pitch_title,
      category: session.category,
      target: String(session.target_duration_seconds),
      script: session.script_used || '',
      pitchId: session.pitch_id || '',
    });
    router.push(`/practice?${query.toString()}`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
          <p className="text-xs text-slate-500">Loading session performance data...</p>
        </div>
      </AppLayout>
    );
  }

  if (!session) {
    return (
      <AppLayout>
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">Session Not Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            The requested practice session could not be located in your history.
          </p>
          <Link href="/history">
            <Button variant="outline" size="sm">
              Return to History
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const diff = session.actual_duration_seconds - session.target_duration_seconds;
  const isOvertime = diff > 0;

  return (
    <>
      {/* SCREEN VIEW (Hidden on print) */}
      <div className="no-print">
        <AppLayout>
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Top Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href="/history" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to History
              </Link>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
                  Print / Save PDF
                </Button>
                <Button variant="primary" size="sm" onClick={handleRepeatPractice} icon={<RotateCcw className="w-4 h-4" />}>
                  Repeat Practice
                </Button>
              </div>
            </div>

            {/* Session Overview Card */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="p-5 sm:p-6 pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="purple" size="sm">
                        {session.category}
                      </Badge>
                      <Badge variant={session.status === 'Analyzed' ? 'purple' : 'success'} size="sm">
                        {session.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-bold">
                      {session.pitch_title}
                    </CardTitle>
                    <div className="text-xs text-slate-400 mt-1">
                      Practiced on {formatDate(session.completed_at || session.created_at)}
                    </div>
                  </div>

                  {/* Timing Pill */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4 text-xs font-mono">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Target</div>
                      <div className="font-bold text-slate-700">{session.target_duration_seconds}s</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Actual</div>
                      <div className="font-bold text-slate-900">{session.actual_duration_seconds}s</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Variance</div>
                      <div className={`font-bold ${isOvertime ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {diff >= 0 ? `+${diff}s` : `${diff}s`}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {/* Practiced Script or Prompt to Enter */}
              <CardContent className="p-5 sm:p-6 pt-0 border-t border-slate-100 mt-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Practiced Script
                    </span>
                    {customScriptText && (
                      <span className="text-xs text-slate-400">
                        {countWords(customScriptText)} words
                      </span>
                    )}
                  </div>

                  {feedback ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed italic">
                      "{customScriptText || 'Spontaneous delivery (no script entered).'}"
                    </div>
                  ) : (
                    <div>
                      <textarea
                        rows={4}
                        value={customScriptText}
                        onChange={(e) => setCustomScriptText(e.target.value)}
                        placeholder="Paste or type what you practiced so the AI can evaluate your clarity and structure..."
                        className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 leading-relaxed text-slate-800"
                      />

                      {analysisError && (
                        <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{analysisError}</span>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {countWords(customScriptText)} words (recommended: ~{session.target_duration_seconds * 2.3} words for {session.target_duration_seconds}s)
                        </span>

                        <Button
                          variant="primary"
                          size="md"
                          onClick={handleTriggerAnalysis}
                          isLoading={isAnalyzing}
                          icon={<Sparkles className="w-4 h-4" />}
                        >
                          Evaluate with AI Coach
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI FEEDBACK EVALUATION SECTION */}
            {feedback && (
              <FeedbackReport
                session={session}
                feedback={feedback}
                onPrint={handlePrint}
              />
            )}
          </div>
        </AppLayout>
      </div>

      {/* PRINT-ONLY VIEW: Beautiful formatted page for PDF and physical printer */}
      <div className="hidden print-only">
        <PrintableSessionReport session={session} feedback={feedback} />
      </div>
    </>
  );
}
