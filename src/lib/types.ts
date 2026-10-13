export type PitchCategory =
  | 'Job Interview'
  | 'Startup Idea'
  | 'Self Introduction'
  | 'Networking'
  | 'Project Presentation'
  | 'Custom';

export type PitchTone =
  | 'Professional'
  | 'Confident'
  | 'Friendly'
  | 'Persuasive'
  | 'Creative';

export interface Pitch {
  id: string;
  user_id: string;
  title: string;
  category: PitchCategory;
  script: string;
  target_duration_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  pitch_id?: string | null;
  pitch_title: string;
  category: PitchCategory;
  script_used?: string;
  target_duration_seconds: number;
  actual_duration_seconds: number;
  status: 'Completed' | 'Incomplete' | 'Analyzed';
  started_at: string;
  completed_at: string;
  created_at: string;
  feedback?: PitchFeedback;
}

export interface FeedbackCategoryScores {
  clarity: number;
  structure: number;
  conciseness: number;
  audience_relevance: number;
  persuasiveness: number;
  hook_strength: number;
  closing_strength: number;
}

export interface PitchFeedback {
  id: string;
  session_id: string;
  user_id: string;
  overall_score: number;
  category_scores: FeedbackCategoryScores;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  hook_suggestion: string;
  closing_suggestion: string;
  refined_pitch: string;
  refined_wpm_duration: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  display_name: string;
  email?: string;
  preferred_duration_seconds: number;
  preferred_wpm: number;
  sound_enabled: boolean;
  created_at?: string;
}

export interface GeneratorInput {
  purpose: string;
  target_audience: string;
  topic: string;
  tone: PitchTone;
  target_duration_seconds: number;
  key_points?: string;
}

export interface AnalysisInput {
  script: string;
  pitch_title: string;
  category: string;
  target_duration_seconds: number;
  actual_duration_seconds: number;
  session_id?: string;
}

export interface AIRecommendations {
  focus_area: string;
  pacing_insight: string;
  key_weaknesses: string[];
  next_session_goal: string;
  encouragement: string;
}

export interface DashboardStats {
  totalSessions: number;
  totalPracticeTimeSeconds: number;
  avgDurationSeconds: number;
  avgScore: number | null;
  scoreImprovement: number | null; // e.g. +8%
  durationPacingRate: number; // % on target (+- 10%)
}
