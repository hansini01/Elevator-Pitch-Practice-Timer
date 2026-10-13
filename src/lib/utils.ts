import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PracticeSession } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format seconds into mm:ss (e.g. 01:30, 00:45)
 */
export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Human friendly format (e.g. "1m 30s" or "45s")
 */
export function formatDurationHuman(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  if (safeSeconds === 0) return '0s';
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

/**
 * Clean word counter ignoring multiple whitespaces
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Calculates estimated speaking duration in seconds based on words and Words Per Minute (WPM)
 * Standard conversational speaking pace is ~130 - 150 WPM. Default: 140 WPM.
 */
export function estimateSpeakingDuration(wordCount: number, wpm: number = 140): number {
  if (wordCount <= 0 || wpm <= 0) return 0;
  return Math.round((wordCount / wpm) * 60);
}

/**
 * Pacing variance evaluation
 */
export function evaluatePacing(actualSeconds: number, targetSeconds: number): {
  diff: number;
  percentage: number;
  status: 'on_target' | 'under_time' | 'over_time';
  message: string;
} {
  const diff = actualSeconds - targetSeconds;
  const percentage = Math.round((diff / targetSeconds) * 100);
  
  if (Math.abs(percentage) <= 10) {
    return {
      diff,
      percentage,
      status: 'on_target',
      message: 'Spot-on pacing! Within ±10% of target duration.',
    };
  } else if (diff < 0) {
    return {
      diff,
      percentage,
      status: 'under_time',
      message: `Finished ${Math.abs(diff)}s earlier than planned. You have room to expand key points.`,
    };
  } else {
    return {
      diff,
      percentage,
      status: 'over_time',
      message: `Exceeded target by ${diff}s. Practice trimming filler words to stay under the limit.`,
    };
  }
}

/**
 * Formats date into readable string
 */
export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Export practice sessions to RFC-4180 compliant CSV string
 */
export function generateSessionsCSV(sessions: PracticeSession[]): string {
  const headers = [
    'ID',
    'Pitch Title',
    'Category',
    'Target Duration (s)',
    'Actual Duration (s)',
    'Status',
    'AI Score',
    'Date Started',
    'Date Completed',
  ];

  const escapeCSV = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = sessions.map((s) => [
    escapeCSV(s.id),
    escapeCSV(s.pitch_title),
    escapeCSV(s.category),
    s.target_duration_seconds,
    s.actual_duration_seconds,
    escapeCSV(s.status),
    s.feedback?.overall_score ?? 'N/A',
    escapeCSV(s.started_at),
    escapeCSV(s.completed_at),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Browser download helper for CSV
 */
export function triggerCSVDownload(csvContent: string, fileName: string = 'pitchperfect-practice-sessions.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
