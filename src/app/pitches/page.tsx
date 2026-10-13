'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { StorageAPI } from '@/lib/storage';
import { Pitch, PitchCategory } from '@/lib/types';
import { countWords, estimateSpeakingDuration, formatDurationHuman, formatDate } from '@/lib/utils';
import {
  Bookmark,
  Plus,
  Search,
  Play,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  FileText,
} from 'lucide-react';

export default function MyPitchesPage() {
  const router = useRouter();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPitch, setEditingPitch] = useState<Pitch | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<PitchCategory>('Job Interview');
  const [formScript, setFormScript] = useState('');
  const [formTargetDuration, setFormTargetDuration] = useState(60);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [pitchToDelete, setPitchToDelete] = useState<Pitch | null>(null);

  const loadPitches = async () => {
    const list = await StorageAPI.getPitches();
    setPitches(list);
  };

  useEffect(() => {
    loadPitches();
  }, []);

  const handleOpenCreate = () => {
    setEditingPitch(null);
    setFormTitle('');
    setFormCategory('Job Interview');
    setFormScript('');
    setFormTargetDuration(60);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pitch: Pitch) => {
    setEditingPitch(pitch);
    setFormTitle(pitch.title);
    setFormCategory(pitch.category);
    setFormScript(pitch.script);
    setFormTargetDuration(pitch.target_duration_seconds);
    setIsModalOpen(true);
  };

  const handleSavePitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formScript.trim()) return;

    setIsSaving(true);
    try {
      await StorageAPI.savePitch({
        id: editingPitch?.id,
        title: formTitle.trim(),
        category: formCategory,
        script: formScript.trim(),
        target_duration_seconds: formTargetDuration,
        user_id: 'local-user',
      });
      setIsModalOpen(false);
      loadPitches();
    } catch (err) {
      console.error('Failed to save pitch:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePitch = async () => {
    if (!pitchToDelete) return;
    try {
      await StorageAPI.deletePitch(pitchToDelete.id);
      setPitchToDelete(null);
      loadPitches();
    } catch (err) {
      console.error('Failed to delete pitch:', err);
    }
  };

  const handlePracticePitch = (pitch: Pitch) => {
    const params = new URLSearchParams({
      title: pitch.title,
      category: pitch.category,
      target: String(pitch.target_duration_seconds),
      script: pitch.script,
      pitchId: pitch.id,
    });
    router.push(`/practice?${params.toString()}`);
  };

  // Filtered pitches
  const filteredPitches = pitches.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.script.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['All', 'Job Interview', 'Startup Idea', 'Self Introduction', 'Networking', 'Project Presentation', 'Custom'];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-indigo-600" />
              My Pitch Library
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage, refine, and launch practice sessions from your saved elevator pitch scripts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" size="md" onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
              Create New Pitch
            </Button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pitches by title or script text..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Pitch Cards Grid */}
        {filteredPitches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPitches.map((pitch) => {
              const words = countWords(pitch.script);
              const estTime = estimateSpeakingDuration(words, 140);

              return (
                <Card key={pitch.id} className="flex flex-col hover:shadow-md transition-shadow border-slate-200">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="purple" size="sm">
                        {pitch.category}
                      </Badge>
                      <Badge variant="slate" size="sm">
                        {pitch.target_duration_seconds}s target
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-2 line-clamp-1">{pitch.title}</CardTitle>
                    <div className="text-[11px] text-slate-400">
                      Updated {formatDate(pitch.updated_at || pitch.created_at)}
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between">
                    {/* Script snippet */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 leading-relaxed italic line-clamp-4 mb-4">
                      "{pitch.script}"
                    </div>

                    {/* Word count & speaking rate */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span className="font-semibold text-slate-700">{words} words</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        ~{formatDurationHuman(estTime)} spoken
                      </span>
                    </div>
                  </CardContent>

                  {/* Actions Footer */}
                  <div className="p-4 bg-slate-50/70 border-t border-slate-100 rounded-b-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(pitch)}
                        className="text-xs p-2 text-slate-600"
                        title="Edit Pitch"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPitchToDelete(pitch)}
                        className="text-xs p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        title="Delete Pitch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePracticePitch(pitch)}
                      icon={<Play className="w-3.5 h-3.5 fill-current" />}
                      className="text-xs font-semibold shadow-xs"
                    >
                      Practice
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No Pitches Found</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              {searchQuery
                ? 'No saved pitches match your search keywords.'
                : 'Create your first saved pitch or generate one with AI!'}
            </p>
            <Button variant="primary" size="sm" onClick={handleOpenCreate}>
              Create Pitch
            </Button>
          </div>
        )}

        {/* Create / Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingPitch ? 'Edit Pitch Script' : 'Create New Pitch'}
          description="Enter your script details. Our timer will calculate pacing and speaking duration."
          maxWidth="xl"
        >
          <form onSubmit={handleSavePitch} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Senior Product Manager Interview Pitch"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as PitchCategory)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white"
                >
                  <option value="Job Interview">Job Interview</option>
                  <option value="Startup Idea">Startup Idea</option>
                  <option value="Self Introduction">Self Introduction</option>
                  <option value="Networking">Networking</option>
                  <option value="Project Presentation">Project Presentation</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Duration (Seconds)
                </label>
                <input
                  type="number"
                  min="15"
                  max="300"
                  required
                  value={formTargetDuration}
                  onChange={(e) => setFormTargetDuration(Number(e.target.value))}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Script Text</label>
                <span className="text-[11px] text-slate-400">
                  {countWords(formScript)} words • ~{formatDurationHuman(estimateSpeakingDuration(countWords(formScript), 140))}
                </span>
              </div>
              <textarea
                required
                rows={6}
                value={formScript}
                onChange={(e) => setFormScript(e.target.value)}
                placeholder="Write or paste your pitch script here..."
                className="w-full text-xs sm:text-sm p-3.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-sans leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                Save Pitch
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!pitchToDelete}
          onClose={() => setPitchToDelete(null)}
          title="Delete Pitch"
          description="Are you sure you want to delete this saved pitch? This cannot be undone."
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-700 font-medium bg-slate-50 p-3 rounded-lg border">
              {pitchToDelete?.title}
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setPitchToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeletePitch}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
