'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GeneratorInput, PitchTone, PitchCategory } from '@/lib/types';
import { countWords, estimateSpeakingDuration, formatDurationHuman } from '@/lib/utils';
import { StorageAPI } from '@/lib/storage';
import {
  Sparkles,
  Copy,
  Check,
  Bookmark,
  Play,
  RotateCcw,
  Clock,
  FileText,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';

export default function GeneratorPage() {
  const router = useRouter();

  // Form states
  const [purpose, setPurpose] = useState('Job Interview');
  const [targetAudience, setTargetAudience] = useState('Hiring Manager at a Tech Company');
  const [topic, setTopic] = useState('Full Stack Software Engineer with Cloud systems experience');
  const [tone, setTone] = useState<PitchTone>('Confident');
  const [targetDuration, setTargetDuration] = useState<number>(60);
  const [keyPoints, setKeyPoints] = useState('Reduced latency by 45%, 500k active users, passionate about real-time systems');

  // Generated results
  const [generatedText, setGeneratedText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [draftSavedMsg, setDraftSavedMsg] = useState<string | null>(null);

  // Live text metrics
  const wordCount = countWords(generatedText);
  const estimatedDuration = estimateSpeakingDuration(wordCount, 140);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setDraftSavedMsg(null);

    try {
      const payload: GeneratorInput = {
        purpose,
        target_audience: targetAudience,
        topic,
        tone,
        target_duration_seconds: targetDuration,
        key_points: keyPoints,
      };

      const res = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to generate pitch');
      }

      setGeneratedText(json.data.pitchText);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error generating pitch';
      setErrorMsg(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveDraft = async () => {
    if (!generatedText) return;
    setIsSavingDraft(true);
    try {
      await StorageAPI.savePitch({
        title: `${purpose} Pitch — ${targetDuration}s`,
        category: (purpose as PitchCategory) || 'Custom',
        script: generatedText,
        target_duration_seconds: targetDuration,
        user_id: 'local-user',
      });
      setDraftSavedMsg('Saved to your Pitch Library!');
      setTimeout(() => setDraftSavedMsg(null), 3000);
    } catch (err) {
      console.error('Failed to save draft pitch:', err);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleStartPractice = () => {
    if (!generatedText) return;
    const params = new URLSearchParams({
      title: `${purpose} Pitch`,
      category: purpose,
      target: String(targetDuration),
      script: generatedText,
    });
    router.push(`/practice?${params.toString()}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            AI Pitch Generator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate high-impact, duration-calibrated elevator pitches using Google Gemini AI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* INPUT FORM (7 cols) */}
          <div className="lg:col-span-7">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg">Pitch Parameters</CardTitle>
                <CardDescription>
                  Tell Gemini who you are speaking to and your core value proposition.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Purpose */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pitch Purpose
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white"
                  >
                    <option value="Job Interview">Job Interview Self-Intro</option>
                    <option value="Startup Idea">Startup Investor Pitch</option>
                    <option value="Self Introduction">Professional Self Introduction</option>
                    <option value="Networking">Networking / Meetup Hook</option>
                    <option value="Project Presentation">Academic / Project Presentation</option>
                    <option value="Custom">Custom Sales / Client Pitch</option>
                  </select>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Angel investors, Recruiter, Potential client"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Topic / Subject */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Topic, Product, or Background
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. AI-powered elevator pitch coach web application"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Tone & Target Duration Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Desired Tone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Desired Tone
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value as PitchTone)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white"
                    >
                      <option value="Confident">Confident</option>
                      <option value="Professional">Professional</option>
                      <option value="Friendly">Friendly & Approachable</option>
                      <option value="Persuasive">Persuasive</option>
                      <option value="Creative">Creative</option>
                    </select>
                  </div>

                  {/* Target Duration */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Duration
                    </label>
                    <select
                      value={targetDuration}
                      onChange={(e) => setTargetDuration(Number(e.target.value))}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white"
                    >
                      <option value="30">30 seconds (~70 words)</option>
                      <option value="60">60 seconds (~140 words)</option>
                      <option value="90">90 seconds (~210 words)</option>
                      <option value="120">120 seconds (~280 words)</option>
                    </select>
                  </div>
                </div>

                {/* Optional Key Points */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Key Highlights / Metrics to Mention <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={keyPoints}
                    onChange={(e) => setKeyPoints(e.target.value)}
                    placeholder="e.g. 40% growth, reduced churn, 4 years experience, specific tech stack"
                    className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 leading-relaxed"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    size="lg"
                    variant="primary"
                    onClick={handleGenerate}
                    isLoading={isGenerating}
                    className="w-full py-3 shadow-md shadow-indigo-200 text-sm font-semibold"
                    icon={<Sparkles className="w-4 h-4" />}
                  >
                    Generate Elevator Pitch
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* GENERATED OUTPUT COLUMN (5 cols) */}
          <div className="lg:col-span-5">
            <Card className="h-full flex flex-col shadow-sm border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Generated Pitch Draft</CardTitle>
                  <CardDescription className="text-xs">
                    Live word count & speaking duration calculation.
                  </CardDescription>
                </div>
                {generatedText && (
                  <Badge variant="purple" size="sm">
                    {wordCount} words
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="flex-1 p-5 flex flex-col justify-between space-y-4">
                {generatedText ? (
                  <div className="flex-1 flex flex-col space-y-3">
                    <textarea
                      value={generatedText}
                      onChange={(e) => setGeneratedText(e.target.value)}
                      rows={10}
                      className="w-full flex-1 p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-sans text-sm leading-relaxed text-slate-900 bg-white"
                      placeholder="Generated pitch script will appear here for editing..."
                    />

                    {/* Calculated Speaking Duration Badge */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <span>Est. Spoken Time:</span>
                        <strong className="text-slate-900 font-mono">
                          ~{formatDurationHuman(estimatedDuration)}
                        </strong>
                      </div>
                      <span className="text-[11px] text-slate-400">@ 140 WPM</span>
                    </div>

                    {draftSavedMsg && (
                      <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {draftSavedMsg}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <Lightbulb className="w-10 h-10 text-indigo-300 mb-3" />
                    <h4 className="text-sm font-semibold text-slate-700">No Pitch Generated Yet</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Fill out the parameters on the left and click "Generate Elevator Pitch" to create your draft.
                    </p>
                  </div>
                )}

                {/* Actions when pitch is ready */}
                {generatedText && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="flex-1 text-xs"
                        icon={isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      >
                        {isCopied ? 'Copied' : 'Copy'}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveDraft}
                        isLoading={isSavingDraft}
                        className="flex-1 text-xs"
                        icon={<Bookmark className="w-3.5 h-3.5" />}
                      >
                        Save to Library
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerate}
                        isLoading={isGenerating}
                        className="text-xs text-slate-600"
                        title="Regenerate"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleStartPractice}
                      className="w-full justify-center shadow-md shadow-indigo-200"
                      icon={<Play className="w-4 h-4 fill-current" />}
                    >
                      Start Practice with this Script
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
