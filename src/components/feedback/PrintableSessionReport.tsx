import React from 'react';
import { PracticeSession, PitchFeedback } from '@/lib/types';
import { formatDate, formatDuration } from '@/lib/utils';

interface PrintableSessionReportProps {
  session: PracticeSession;
  feedback?: PitchFeedback | null;
}

export const PrintableSessionReport: React.FC<PrintableSessionReportProps> = ({
  session,
  feedback,
}) => {
  const diff = session.actual_duration_seconds - session.target_duration_seconds;

  return (
    <div className="print-page bg-white p-8 max-w-4xl mx-auto text-black">
      {/* Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            PitchPerfect AI — Performance Evaluation Report
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Elevator Pitch Practice & AI Coach Assessment
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div>Report Date: {formatDate(new Date().toISOString())}</div>
          <div>Session ID: {session.id}</div>
        </div>
      </div>

      {/* Session Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg mb-6 text-xs">
        <div>
          <div className="text-slate-500 font-semibold uppercase">Pitch Title</div>
          <div className="font-bold text-slate-900 mt-0.5 text-sm">{session.pitch_title}</div>
        </div>
        <div>
          <div className="text-slate-500 font-semibold uppercase">Category</div>
          <div className="font-bold text-slate-900 mt-0.5">{session.category}</div>
        </div>
        <div>
          <div className="text-slate-500 font-semibold uppercase">Target vs Actual</div>
          <div className="font-bold text-slate-900 mt-0.5">
            {session.target_duration_seconds}s target / {session.actual_duration_seconds}s actual ({diff >= 0 ? `+${diff}s` : `${diff}s`})
          </div>
        </div>
        <div>
          <div className="text-slate-500 font-semibold uppercase">Overall Score</div>
          <div className="font-bold text-indigo-700 mt-0.5 text-base">
            {feedback ? `${feedback.overall_score}/100` : 'Not Analyzed'}
          </div>
        </div>
      </div>

      {/* Script Practiced */}
      {session.script_used && (
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Spoken Script
          </h3>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed italic text-slate-800">
            "{session.script_used}"
          </div>
        </div>
      )}

      {/* Feedback Breakdown */}
      {feedback && (
        <div className="space-y-6">
          {/* Category Scores */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Performance Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {Object.entries(feedback.category_scores || {}).map(([key, score]) => (
                <div key={key} className="p-2.5 border border-slate-200 rounded bg-white flex justify-between items-center">
                  <span className="capitalize font-medium text-slate-700">{key.replace('_', ' ')}:</span>
                  <span className="font-bold text-slate-900">{score}/100</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <h4 className="text-xs font-bold uppercase text-emerald-800 mb-2">
                Demonstrated Strengths
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                {feedback.strengths.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg">
              <h4 className="text-xs font-bold uppercase text-amber-800 mb-2">
                Key Opportunities for Improvement
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                {feedback.improvements.map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested Hook & Refined Pitch */}
          {feedback.refined_pitch && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                AI Refined Version
              </h3>
              <div className="p-4 border border-slate-300 rounded-lg bg-slate-50 text-xs leading-relaxed text-slate-900 font-sans">
                {feedback.refined_pitch}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
        Generated by PitchPerfect AI • Elevator Pitch Practice Timer & Coach • https://pitchperfect.ai
      </div>
    </div>
  );
};
