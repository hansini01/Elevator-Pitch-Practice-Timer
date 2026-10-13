'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { PracticeSession } from '@/lib/types';
import { formatDuration, formatDate } from '@/lib/utils';
import { StorageAPI } from '@/lib/storage';
import {
  Sparkles,
  RotateCcw,
  Trash2,
  ExternalLink,
  Clock,
  Award,
  AlertTriangle,
} from 'lucide-react';

interface RecentSessionsProps {
  sessions: PracticeSession[];
  onSessionDeleted?: () => void;
}

export const RecentSessions: React.FC<RecentSessionsProps> = ({
  sessions,
  onSessionDeleted,
}) => {
  const router = useRouter();
  const [sessionToDelete, setSessionToDelete] = useState<PracticeSession | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    try {
      await StorageAPI.deleteSession(sessionToDelete.id);
      setSessionToDelete(null);
      if (onSessionDeleted) {
        onSessionDeleted();
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRepeatSession = (session: PracticeSession) => {
    // Navigate to practice page with query parameters
    const params = new URLSearchParams({
      title: session.pitch_title,
      category: session.category,
      target: String(session.target_duration_seconds),
      script: session.script_used || '',
      pitchId: session.pitch_id || '',
    });
    router.push(`/practice?${params.toString()}`);
  };

  if (sessions.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base sm:text-lg">Recent Practice Sessions</CardTitle>
          <CardDescription>
            Performance history, AI evaluation badges, and quick actions.
          </CardDescription>
        </div>
        <Link href="/history">
          <Button variant="ghost" size="sm" className="text-xs">
            View All ({sessions.length})
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">Pitch Details</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">AI Score</th>
                <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.slice(0, 5).map((session) => {
                const diff = session.actual_duration_seconds - session.target_duration_seconds;
                const isOvertime = diff > 0;

                return (
                  <tr key={session.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Pitch Details */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-semibold text-slate-900 line-clamp-1 max-w-[220px]">
                        {session.pitch_title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span>{formatDate(session.completed_at || session.created_at)}</span>
                        <span>•</span>
                        <span className="text-indigo-600 font-medium">{session.category}</span>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDuration(session.actual_duration_seconds)}</span>
                        <span className="text-slate-400 text-xs">
                          / {session.target_duration_seconds}s
                        </span>
                      </div>
                      {Math.abs(diff) > 0 && (
                        <span
                          className={`text-[10px] font-semibold ${
                            isOvertime ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {isOvertime ? `+${diff}s overtime` : `${diff}s under`}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {session.status === 'Analyzed' ? (
                        <Badge variant="purple" size="sm">
                          Analyzed
                        </Badge>
                      ) : session.status === 'Completed' ? (
                        <Badge variant="success" size="sm">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Incomplete
                        </Badge>
                      )}
                    </td>

                    {/* AI Score */}
                    <td className="py-3.5 px-4">
                      {session.feedback?.overall_score ? (
                        <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                          <Award className="w-3.5 h-3.5 text-purple-600" />
                          <span>{session.feedback.overall_score}/100</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Not analyzed</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View feedback link */}
                        <Link href={`/history/${session.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs px-2.5 py-1"
                            title="View Feedback & Detailed Report"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>

                        {/* Repeat session */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRepeatSession(session)}
                          className="text-xs px-2.5 py-1 text-slate-600"
                          title="Repeat Practice Session"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>

                        {/* Delete session */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSessionToDelete(session)}
                          className="text-xs px-2.5 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete Session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        title="Delete Practice Session"
        description="Are you sure you want to permanently delete this practice record? This action cannot be undone."
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-800">
              {sessionToDelete?.pitch_title}
            </span>
            <div className="text-slate-500 mt-1">
              Duration: {sessionToDelete?.actual_duration_seconds}s • Target: {sessionToDelete?.target_duration_seconds}s
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSessionToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};
