'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { StorageAPI } from '@/lib/storage';
import { PracticeSession, PitchCategory } from '@/lib/types';
import { formatDuration, formatDate, generateSessionsCSV, triggerCSVDownload } from '@/lib/utils';
import {
  History,
  Download,
  Search,
  ExternalLink,
  RotateCcw,
  Trash2,
  Clock,
  Award,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export default function SessionHistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sessionToDelete, setSessionToDelete] = useState<PracticeSession | null>(null);

  const loadSessions = async () => {
    const list = await StorageAPI.getSessions();
    setSessions(list);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleExportCSV = () => {
    if (sessions.length === 0) return;
    const csv = generateSessionsCSV(sessions);
    triggerCSVDownload(csv, `pitchperfect-sessions-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleDelete = async () => {
    if (!sessionToDelete) return;
    try {
      await StorageAPI.deleteSession(sessionToDelete.id);
      setSessionToDelete(null);
      loadSessions();
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleRepeat = (session: PracticeSession) => {
    const params = new URLSearchParams({
      title: session.pitch_title,
      category: session.category,
      target: String(session.target_duration_seconds),
      script: session.script_used || '',
      pitchId: session.pitch_id || '',
    });
    router.push(`/practice?${params.toString()}`);
  };

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.pitch_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.script_used && s.script_used.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'All' || s.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <History className="w-6 h-6 text-indigo-600" />
              Session Practice History
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Comprehensive log of all practiced pitches, delivery durations, and AI evaluations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={handleExportCSV}
              disabled={sessions.length === 0}
              icon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Search & Filters toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          {/* Search bar */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or script keywords..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Category filter */}
          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 bg-white"
            >
              <option value="All">All Categories</option>
              <option value="Job Interview">Job Interview</option>
              <option value="Startup Idea">Startup Idea</option>
              <option value="Self Introduction">Self Introduction</option>
              <option value="Networking">Networking</option>
              <option value="Project Presentation">Project Presentation</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Analyzed">Analyzed with AI</option>
              <option value="Completed">Completed Only</option>
            </select>
          </div>
        </div>

        {/* Sessions Table */}
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-0">
            {filteredSessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                      <th className="py-3.5 px-4 sm:px-6">Pitch Title & Date</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Duration (Goal / Actual)</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">AI Score</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSessions.map((session) => {
                      const diff = session.actual_duration_seconds - session.target_duration_seconds;
                      const isOvertime = diff > 0;

                      return (
                        <tr key={session.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="font-semibold text-slate-900 line-clamp-1 max-w-[240px]">
                              {session.pitch_title}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {formatDate(session.completed_at || session.created_at)}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <Badge variant="purple" size="sm">
                              {session.category}
                            </Badge>
                          </td>

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

                          <td className="py-3.5 px-4">
                            {session.status === 'Analyzed' ? (
                              <Badge variant="purple" size="sm">
                                Analyzed
                              </Badge>
                            ) : (
                              <Badge variant="success" size="sm">
                                Completed
                              </Badge>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {session.feedback ? (
                              <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                                <Award className="w-3.5 h-3.5 text-purple-600" />
                                <span>{session.feedback.overall_score}/100</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">Not analyzed</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link href={`/history/${session.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs px-2.5 py-1"
                                  title="View Detailed AI Report"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                  Report
                                </Button>
                              </Link>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRepeat(session)}
                                className="text-xs px-2.5 py-1 text-slate-600"
                                title="Repeat Practice"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSessionToDelete(session)}
                                className="text-xs px-2.5 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                title="Delete Record"
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
            ) : (
              <div className="p-12 text-center text-slate-500">
                <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-700">No Sessions Found</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {searchQuery || categoryFilter !== 'All'
                    ? 'No sessions match your filter criteria.'
                    : 'Start practicing with the elevator pitch timer to see records here.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Modal */}
        <Modal
          isOpen={!!sessionToDelete}
          onClose={() => setSessionToDelete(null)}
          title="Delete Practice Session"
          description="Are you sure you want to permanently delete this practice record?"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-700 font-medium bg-slate-50 p-3 rounded-lg border">
              {sessionToDelete?.pitch_title} ({sessionToDelete?.actual_duration_seconds}s)
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSessionToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Delete Record
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
