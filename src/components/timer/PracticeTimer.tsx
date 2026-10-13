'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  RotateCcw,
  SquareCheck,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Sparkles,
  AlertTriangle,
  Clock,
  BookOpen,
  Keyboard,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { PitchCategory, PracticeSession } from '@/lib/types';
import {
  formatDuration,
  formatDurationHuman,
  countWords,
  estimateSpeakingDuration,
  evaluatePacing,
} from '@/lib/utils';
import { playTimeCompleteChime, playWarningChime, playTickSound } from '@/lib/sound';
import { StorageAPI } from '@/lib/storage';

interface PracticeTimerProps {
  initialPitchTitle?: string;
  initialCategory?: PitchCategory;
  initialScript?: string;
  initialTargetDuration?: number;
  pitchId?: string | null;
}

export const PracticeTimer: React.FC<PracticeTimerProps> = ({
  initialPitchTitle = 'Untitled Elevator Pitch',
  initialCategory = 'Job Interview',
  initialScript = '',
  initialTargetDuration = 60,
  pitchId = null,
}) => {
  const router = useRouter();

  // Setup configuration state
  const [pitchTitle, setPitchTitle] = useState(initialPitchTitle);
  const [category, setCategory] = useState<PitchCategory>(initialCategory);
  const [script, setScript] = useState(initialScript);
  const [targetDuration, setTargetDuration] = useState<number>(initialTargetDuration);
  const [customDurationInput, setCustomDurationInput] = useState<string>('60');
  const [isSpontaneous, setIsSpontaneous] = useState<boolean>(!initialScript);

  // Timer operational state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showScript, setShowScript] = useState<boolean>(true);
  const [distractionFree, setDistractionFree] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('lg');
  const [warningChimePlayed, setWarningChimePlayed] = useState<boolean>(false);
  const [completionChimePlayed, setCompletionChimePlayed] = useState<boolean>(false);
  const [sessionSaved, setSessionSaved] = useState<boolean>(false);
  const [savingLoading, setSavingLoading] = useState<boolean>(false);

  // High-precision timestamp refs to prevent interval drift
  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Sound preference from user profile
  useEffect(() => {
    StorageAPI.getProfile().then((profile) => {
      setSoundEnabled(profile.sound_enabled ?? true);
    });
  }, []);

  // Update elapsed time using timestamp calculation
  const updateTimer = useCallback(() => {
    if (!startTimeRef.current) return;
    const now = Date.now();
    const currentRunElapsed = (now - startTimeRef.current) / 1000;
    const totalElapsed = accumulatedTimeRef.current + currentRunElapsed;
    setElapsedSeconds(totalElapsed);

    // Audio cue: warning when 10 seconds remaining
    const remaining = targetDuration - totalElapsed;
    if (remaining <= 10 && remaining > 9.5 && !warningChimePlayed) {
      if (soundEnabled) playWarningChime();
      setWarningChimePlayed(true);
    }

    // Audio cue: target time reached
    if (totalElapsed >= targetDuration && !completionChimePlayed) {
      if (soundEnabled) playTimeCompleteChime();
      setCompletionChimePlayed(true);
    }

    animFrameIdRef.current = requestAnimationFrame(updateTimer);
  }, [targetDuration, soundEnabled, warningChimePlayed, completionChimePlayed]);

  // Handle Start
  const handleStart = () => {
    if (isRunning && !isPaused) return;

    if (soundEnabled) playTickSound();
    startTimeRef.current = Date.now();
    setIsRunning(true);
    setIsPaused(false);
    animFrameIdRef.current = requestAnimationFrame(updateTimer);
  };

  // Handle Pause
  const handlePause = () => {
    if (!isRunning || isPaused) return;

    if (startTimeRef.current) {
      const now = Date.now();
      accumulatedTimeRef.current += (now - startTimeRef.current) / 1000;
      startTimeRef.current = null;
    }

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (soundEnabled) playTickSound();
    setIsPaused(true);
  };

  // Handle Resume
  const handleResume = () => {
    if (!isRunning || !isPaused) return;

    if (soundEnabled) playTickSound();
    startTimeRef.current = Date.now();
    setIsPaused(false);
    animFrameIdRef.current = requestAnimationFrame(updateTimer);
  };

  // Handle Reset
  const handleReset = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    startTimeRef.current = null;
    accumulatedTimeRef.current = 0;
    setElapsedSeconds(0);
    setIsRunning(false);
    setIsPaused(false);
    setWarningChimePlayed(false);
    setCompletionChimePlayed(false);
    if (soundEnabled) playTickSound();
  };

  // Finish Practice and Save
  const handleFinish = async () => {
    // Stop the timer
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (startTimeRef.current) {
      const now = Date.now();
      accumulatedTimeRef.current += (now - startTimeRef.current) / 1000;
      startTimeRef.current = null;
    }

    const finalActualSeconds = Math.max(1, Math.round(accumulatedTimeRef.current || elapsedSeconds));
    setSavingLoading(true);

    try {
      const nowIso = new Date().toISOString();
      const newSession: Omit<PracticeSession, 'id' | 'created_at'> = {
        user_id: 'local-user',
        pitch_id: pitchId,
        pitch_title: pitchTitle.trim() || 'Untitled Elevator Pitch',
        category,
        script_used: isSpontaneous ? '' : script,
        target_duration_seconds: targetDuration,
        actual_duration_seconds: finalActualSeconds,
        status: 'Completed',
        started_at: new Date(Date.now() - finalActualSeconds * 1000).toISOString(),
        completed_at: nowIso,
      };

      const saved = await StorageAPI.saveSession(newSession);
      setSessionSaved(true);

      // Navigate to the newly saved session details page
      router.push(`/history/${saved.id}`);
    } catch (err) {
      console.error('Failed to save practice session:', err);
      setSavingLoading(false);
    }
  };

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isRunning) {
          handleStart();
        } else if (isPaused) {
          handleResume();
        } else {
          handlePause();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (isRunning || elapsedSeconds > 0) {
          handleFinish();
        }
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setShowScript((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, isPaused, elapsedSeconds, handleStart, handlePause, handleResume, handleReset, handleFinish]);

  // Clean up animation frames on unmount
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  // Compute timing variables
  const remainingSeconds = targetDuration - elapsedSeconds;
  const isOvertime = remainingSeconds < 0;
  const isNearEnd = remainingSeconds <= 10 && remainingSeconds > 0;
  const progressRatio = Math.min(1, Math.max(0, elapsedSeconds / targetDuration));

  // Circular progress SVG calculations
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Words & estimated duration
  const wordCount = countWords(script);
  const estimatedSeconds = estimateSpeakingDuration(wordCount, 140);
  const pacingEval = evaluatePacing(Math.round(elapsedSeconds), targetDuration);

  // SVG meter ring color
  let ringColor = 'stroke-indigo-600';
  let badgeStatusColor: 'default' | 'warning' | 'danger' | 'success' = 'default';

  if (isOvertime) {
    ringColor = 'stroke-rose-600 animate-pulse';
    badgeStatusColor = 'danger';
  } else if (isNearEnd) {
    ringColor = 'stroke-amber-500';
    badgeStatusColor = 'warning';
  } else if (isRunning) {
    ringColor = 'stroke-indigo-600';
    badgeStatusColor = 'default';
  }

  return (
    <div className={`space-y-6 ${distractionFree ? 'max-w-4xl mx-auto' : ''}`}>
      {/* Top Header / Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Elevator Pitch Practice
            {isOvertime && (
              <Badge variant="danger" size="md">
                <AlertTriangle className="w-3.5 h-3.5" /> OVERTIME +{formatDuration(Math.abs(remainingSeconds))}
              </Badge>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time high precision timer with instant pacing alerts and AI evaluation.
          </p>
        </div>

        {/* Controls: Audio toggle & Distraction-free */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute sound chimes' : 'Unmute sound chimes'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-indigo-600 mr-1.5" /> Sound On
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400 mr-1.5" /> Muted
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDistractionFree(!distractionFree)}
            title="Toggle Distraction-Free Practice View"
          >
            {distractionFree ? (
              <>
                <Minimize2 className="w-4 h-4 mr-1.5" /> Exit Focus
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 mr-1.5" /> Focus Mode
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid: Timer on left/center, Setup & Script on right */}
      <div className={`grid grid-cols-1 ${distractionFree ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-6`}>
        {/* TIMER COLUMN */}
        <div className={distractionFree ? 'w-full' : 'lg:col-span-7'}>
          <Card className="flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden bg-white shadow-md border-slate-200">
            {/* Background glowing indicator */}
            <div
              className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700 ${
                isOvertime ? 'bg-rose-500' : isNearEnd ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
            />

            {/* Title / Category Pill */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-center">
              <span className="font-semibold text-slate-800 text-base max-w-xs truncate">
                {pitchTitle || 'Untitled Pitch'}
              </span>
              <Badge variant="purple" size="sm">
                {category}
              </Badge>
              <Badge variant="slate" size="sm">
                Target: {targetDuration}s
              </Badge>
            </div>

            {/* Circular Progress Countdown Display */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-2 select-none">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 280 280">
                {/* Background Ring */}
                <circle
                  cx="140"
                  cy="140"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="12"
                  fill="transparent"
                />

                {/* Progress Ring */}
                <circle
                  cx="140"
                  cy="140"
                  r={radius}
                  className={`${ringColor} transition-all duration-100 ease-linear`}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Center Time Readouts */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {isOvertime ? 'Overtime' : isRunning ? 'Remaining Time' : 'Ready'}
                </span>

                {/* Main Countdown Digits */}
                <div
                  className={`text-5xl sm:text-6xl font-black tracking-tight font-mono tabular-nums transition-colors ${
                    isOvertime
                      ? 'text-rose-600'
                      : isNearEnd
                      ? 'text-amber-600 animate-pulse'
                      : 'text-slate-900'
                  }`}
                >
                  {isOvertime
                    ? `+${formatDuration(Math.abs(remainingSeconds))}`
                    : formatDuration(Math.max(0, remainingSeconds))}
                </div>

                {/* Elapsed vs Target subtext */}
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span>Elapsed: {formatDuration(elapsedSeconds)}</span>
                  <span>•</span>
                  <span>Goal: {formatDuration(targetDuration)}</span>
                </div>

                {/* Pacing status badge during or after run */}
                {elapsedSeconds > 3 && (
                  <div className="mt-2">
                    <Badge variant={badgeStatusColor} size="sm">
                      {isOvertime
                        ? `Over by ${Math.round(Math.abs(remainingSeconds))}s`
                        : isNearEnd
                        ? 'Final 10 seconds!'
                        : `${Math.round(progressRatio * 100)}% complete`}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Primary Action Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8 w-full max-w-md">
              {!isRunning ? (
                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleStart}
                  className="flex-1 py-3 text-base shadow-lg shadow-indigo-200"
                  icon={<Play className="w-5 h-5 fill-current" />}
                >
                  Start Pitch
                </Button>
              ) : isPaused ? (
                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleResume}
                  className="flex-1 py-3 text-base shadow-lg shadow-indigo-200"
                  icon={<Play className="w-5 h-5 fill-current" />}
                >
                  Resume
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handlePause}
                  className="flex-1 py-3 text-base"
                  icon={<Pause className="w-5 h-5 fill-current" />}
                >
                  Pause
                </Button>
              )}

              <Button
                size="lg"
                variant="outline"
                onClick={handleReset}
                disabled={!isRunning && elapsedSeconds === 0}
                className="px-4"
                title="Reset timer (R)"
              >
                <RotateCcw className="w-5 h-5 text-slate-600" />
              </Button>

              <Button
                size="lg"
                variant="secondary"
                onClick={handleFinish}
                disabled={elapsedSeconds === 0 || savingLoading}
                isLoading={savingLoading}
                className="px-5 shadow-sm"
                icon={<SquareCheck className="w-5 h-5" />}
              >
                Finish & Evaluate
              </Button>
            </div>

            {/* Keyboard Shortcuts helper pill */}
            <div className="mt-6 pt-5 border-t border-slate-100 w-full flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-700 font-mono">
                  Space
                </kbd>{' '}
                Start / Pause
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-700 font-mono">
                  R
                </kbd>{' '}
                Reset
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-700 font-mono">
                  F
                </kbd>{' '}
                Finish
              </span>
            </div>
          </Card>
        </div>

        {/* SETUP & SCRIPT COLUMN */}
        <div className={distractionFree ? 'w-full' : 'lg:col-span-5'}>
          <div className="space-y-6">
            {/* Script Teleprompter Card */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="p-4 sm:p-5 flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <CardTitle className="text-sm sm:text-base">Pitch Teleprompter</CardTitle>
                </div>

                <div className="flex items-center gap-2">
                  {/* Font size toggle */}
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs">
                    {(['base', 'lg', 'xl'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`px-2 py-0.5 rounded capitalize ${
                          fontSize === size
                            ? 'bg-white font-bold text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {size === 'base' ? 'A' : size === 'lg' ? 'A+' : 'A++'}
                      </button>
                    ))}
                  </div>

                  {/* Show/Hide Script toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowScript(!showScript)}
                    title={showScript ? 'Hide script during practice' : 'Show script'}
                  >
                    {showScript ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 pt-0">
                {showScript ? (
                  <div>
                    {isSpontaneous ? (
                      <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                        <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                        <h4 className="text-sm font-semibold text-slate-800">Spontaneous Practice Mode</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                          You are practicing without a pre-written script. Focus on structured thinking, your core hook, and finishing before the timer hits 0.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsSpontaneous(false)}
                          className="mt-3 text-xs"
                        >
                          Switch to Scripted Mode
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          value={script}
                          onChange={(e) => setScript(e.target.value)}
                          placeholder="Type or paste your elevator pitch script here..."
                          disabled={isRunning}
                          rows={6}
                          className={`w-full p-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-sans leading-relaxed text-slate-800 ${
                            fontSize === 'base'
                              ? 'text-sm'
                              : fontSize === 'lg'
                              ? 'text-base'
                              : 'text-lg leading-loose'
                          }`}
                        />

                        {/* Script stats */}
                        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
                          <span className="font-medium text-slate-700">
                            {wordCount} words
                          </span>
                          <span>
                            Est. spoken read time: ~{formatDurationHuman(estimatedSeconds)} (at 140 WPM)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-slate-50 text-center text-slate-500 text-sm">
                    <EyeOff className="w-6 h-6 mx-auto mb-1.5 text-slate-400" />
                    Script is hidden for spontaneous recall practice.
                    <div className="mt-2">
                      <Button variant="outline" size="sm" onClick={() => setShowScript(true)}>
                        Show Script
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Target Duration & Metadata Settings Card */}
            {!distractionFree && (
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="p-4 sm:p-5 pb-3">
                  <CardTitle className="text-sm sm:text-base">Pitch Parameters</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
                  {/* Pitch Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pitch Title
                    </label>
                    <input
                      type="text"
                      value={pitchTitle}
                      onChange={(e) => setPitchTitle(e.target.value)}
                      disabled={isRunning}
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="e.g. Job Interview for Senior Role"
                    />
                  </div>

                  {/* Category Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as PitchCategory)}
                      disabled={isRunning}
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white"
                    >
                      <option value="Job Interview">Job Interview</option>
                      <option value="Startup Idea">Startup Idea</option>
                      <option value="Self Introduction">Self Introduction</option>
                      <option value="Networking">Networking</option>
                      <option value="Project Presentation">Project Presentation</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  {/* Target Duration Pills */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Target Duration
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[30, 60, 90].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          disabled={isRunning}
                          onClick={() => {
                            setTargetDuration(dur);
                            setCustomDurationInput(String(dur));
                          }}
                          className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                            targetDuration === dur
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {dur}s
                        </button>
                      ))}

                      {/* Custom duration option */}
                      <div className="relative">
                        <input
                          type="number"
                          min="15"
                          max="300"
                          disabled={isRunning}
                          value={customDurationInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomDurationInput(val);
                            const num = parseInt(val, 10);
                            if (!isNaN(num) && num > 0) {
                              setTargetDuration(num);
                            }
                          }}
                          placeholder="Custom"
                          className="w-full py-2 text-center text-xs font-semibold rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Spontaneous toggle */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">Practice Spontaneously</span>
                    <input
                      type="checkbox"
                      id="spontaneous"
                      checked={isSpontaneous}
                      onChange={(e) => setIsSpontaneous(e.target.checked)}
                      disabled={isRunning}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
