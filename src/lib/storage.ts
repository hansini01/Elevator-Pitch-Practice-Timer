'use client';

import { createClient, isSupabaseConfigured } from './supabase/client';
import { Pitch, PracticeSession, PitchFeedback, UserProfile, DashboardStats } from './types';

const STORAGE_KEYS = {
  PITCHES: 'pitchperfect_pitches_v1',
  SESSIONS: 'pitchperfect_sessions_v1',
  PROFILE: 'pitchperfect_profile_v1',
  INITIALIZED: 'pitchperfect_initialized_v1',
};

// Default Starter Data for demonstration & immediate testing
const INITIAL_PITCHES: Pitch[] = [
  {
    id: 'pitch-1-software-eng',
    user_id: 'local-user',
    title: 'Senior Software Engineer Self-Introduction',
    category: 'Job Interview',
    script:
      "Hi, I'm Alex. Over the last 4 years, I've specialized in full-stack engineering and cloud-native systems. At my previous team, I led the migration of a legacy billing pipeline to a microservices architecture, which slashed latency by 45% and scaled to over 500,000 daily active users. What excites me most about this role is your focus on real-time collaboration tools—an area where my background in distributed systems and user-centric design can deliver immediate value.",
    target_duration_seconds: 45,
    created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'pitch-2-startup-fintech',
    user_id: 'local-user',
    title: 'FinFlow: Automated Cash Flow Forecasting',
    category: 'Startup Idea',
    script:
      "Over 82% of small businesses fail due to cash flow miscalculations, not lack of demand. Current accounting tools only tell founders what happened last month—not what will happen next week. That's why we built FinFlow: an AI financial co-pilot that syncs with bank feeds in seconds and predicts cash crunches 30 days before they happen. We already have 25 beta businesses and a 40% monthly growth rate. We're raising $500,000 to accelerate our banking integrations.",
    target_duration_seconds: 60,
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'pitch-3-networking',
    user_id: 'local-user',
    title: 'Tech Meetup Quick Introduction',
    category: 'Networking',
    script:
      "Hey everyone! I'm Jordan, a product designer and developer passionate about accessibility in tech. I help early-stage founders turn messy prototypes into accessible, intuitive web apps. If anyone here is building something in edtech or developer tooling, I'd love to swap war stories over coffee!",
    target_duration_seconds: 30,
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_SESSIONS: PracticeSession[] = [
  {
    id: 'session-demo-1',
    user_id: 'local-user',
    pitch_id: 'pitch-1-software-eng',
    pitch_title: 'Senior Software Engineer Self-Introduction',
    category: 'Job Interview',
    script_used: INITIAL_PITCHES[0].script,
    target_duration_seconds: 45,
    actual_duration_seconds: 47,
    status: 'Analyzed',
    started_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 47000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    feedback: {
      id: 'fb-demo-1',
      session_id: 'session-demo-1',
      user_id: 'local-user',
      overall_score: 88,
      category_scores: {
        clarity: 92,
        structure: 88,
        conciseness: 85,
        audience_relevance: 90,
        persuasiveness: 84,
        hook_strength: 86,
        closing_strength: 91,
      },
      strengths: [
        'Strong quantifiable metric (45% latency reduction, 500k DAU).',
        'Clear alignment with the company’s real-time collaboration focus.',
        'Well-balanced duration with concise phrasing.',
      ],
      improvements: [
        'The opening could begin with a sharper value-statement before stating years of experience.',
        'Specify one concrete technical stack or tool if relevant to the employer.',
      ],
      recommendations: [
        'Practice emphasizing the impact metric with a deliberate half-second pause.',
        'Keep maintaining the 45-second pacing—your timing was nearly flawless (+2s).',
      ],
      hook_suggestion:
        "I build resilient cloud systems that turn complex backend bottlenecks into sub-second user experiences.",
      closing_suggestion:
        "I would love to bring that same distributed systems expertise to scale your collaboration platform.",
      refined_pitch:
        "Hi, I'm Alex. Over the last 4 years, I've designed and scaled cloud systems that handle high-concurrency workloads. Recently, I led a major billing architecture overhaul that cut system latency by 45% for 500,000 active users. What excites me most about this role is your focus on real-time collaboration—where my experience in distributed reliability can deliver immediate impact.",
      refined_wpm_duration: 44,
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
  },
  {
    id: 'session-demo-2',
    user_id: 'local-user',
    pitch_id: 'pitch-2-startup-fintech',
    pitch_title: 'FinFlow: Automated Cash Flow Forecasting',
    category: 'Startup Idea',
    script_used: INITIAL_PITCHES[1].script,
    target_duration_seconds: 60,
    actual_duration_seconds: 63,
    status: 'Analyzed',
    started_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 1 * 24 * 3600 * 1000 + 63000).toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    feedback: {
      id: 'fb-demo-2',
      session_id: 'session-demo-2',
      user_id: 'local-user',
      overall_score: 93,
      category_scores: {
        clarity: 95,
        structure: 94,
        conciseness: 90,
        audience_relevance: 96,
        persuasiveness: 95,
        hook_strength: 92,
        closing_strength: 89,
      },
      strengths: [
        'Powerful problem hook (82% small business failure rate).',
        'Distinctive value proposition contrasting backward-looking vs forward-looking software.',
        'Compelling traction metrics (25 betas, 40% monthly growth).',
      ],
      improvements: [
        'Make the fundraising ask more concrete by stating key milestones this $500k will achieve.',
      ],
      recommendations: [
        'Add a one-sentence mention of your proprietary AI advantage or moat.',
        'Great job keeping within 3 seconds of the 60-second limit.',
      ],
      hook_suggestion:
        "Eighty-two percent of small businesses fail not because of low sales, but because they run out of cash unexpectedly.",
      closing_suggestion:
        "We are raising $500k to expand our direct bank integrations and reach 200 paying SMBs by Q3.",
      refined_pitch:
        "Eighty-two percent of small businesses fail from unexpected cash crunches, not lack of demand. Traditional accounting tools only report what happened yesterday. FinFlow is an AI copilot that connects to bank feeds and predicts liquidity 30 days ahead. With 25 active betas and 40% month-over-month growth, we are raising $500,000 to scale bank partnerships and prevent SMB failures nationwide.",
      refined_wpm_duration: 58,
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    },
  },
];

const DEFAULT_PROFILE: UserProfile = {
  id: 'user-default',
  display_name: 'Alex Morgan',
  email: 'alex.morgan@pitchperfect.ai',
  preferred_duration_seconds: 60,
  preferred_wpm: 140,
  sound_enabled: true,
};

// Helper to initialize local storage if needed
function ensureLocalStorageInitialized() {
  if (typeof window === 'undefined') return;
  const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!isInit) {
    localStorage.setItem(STORAGE_KEYS.PITCHES, JSON.stringify(INITIAL_PITCHES));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}

/**
 * Storage API: Unified access between Supabase and Local Demo Fallback
 */
export const StorageAPI = {
  isCloudMode(): boolean {
    return isSupabaseConfigured();
  },

  // --- USER PROFILE ---
  async getProfile(): Promise<UserProfile> {
    if (typeof window === 'undefined') return DEFAULT_PROFILE;

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (data) {
            return {
              id: data.id,
              display_name: data.display_name || user.email?.split('@')[0] || 'Practitioner',
              email: user.email,
              preferred_duration_seconds: data.preferred_duration_seconds || 60,
              preferred_wpm: data.preferred_wpm || 140,
              sound_enabled: data.sound_enabled ?? true,
            };
          }
        }
      }
    }

    ensureLocalStorageInitialized();
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return raw ? JSON.parse(raw) : DEFAULT_PROFILE;
  },

  async saveProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getProfile();
    const updated = { ...current, ...profile };

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').upsert({
            id: user.id,
            display_name: updated.display_name,
            preferred_duration_seconds: updated.preferred_duration_seconds,
            preferred_wpm: updated.preferred_wpm,
            sound_enabled: updated.sound_enabled,
            updated_at: new Date().toISOString(),
          });
        }
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    }
    return updated;
  },

  // --- PITCHES ---
  async getPitches(): Promise<Pitch[]> {
    if (typeof window === 'undefined') return INITIAL_PITCHES;

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('pitches')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data as Pitch[];
      }
    }

    ensureLocalStorageInitialized();
    const raw = localStorage.getItem(STORAGE_KEYS.PITCHES);
    return raw ? JSON.parse(raw) : INITIAL_PITCHES;
  },

  async getPitchById(id: string): Promise<Pitch | null> {
    const pitches = await this.getPitches();
    return pitches.find((p) => p.id === id) || null;
  },

  async savePitch(pitch: Omit<Pitch, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Pitch> {
    const id = pitch.id || 'pitch-' + Date.now();
    const now = new Date().toISOString();
    const newPitch: Pitch = {
      id,
      user_id: pitch.user_id || 'local-user',
      title: pitch.title,
      category: pitch.category,
      script: pitch.script,
      target_duration_seconds: pitch.target_duration_seconds,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        const payload = {
          ...newPitch,
          user_id: user?.id || newPitch.user_id,
        };
        const { data, error } = await supabase.from('pitches').upsert(payload).select().single();
        if (!error && data) return data as Pitch;
      }
    }

    if (typeof window !== 'undefined') {
      ensureLocalStorageInitialized();
      const pitches = await this.getPitches();
      const existingIdx = pitches.findIndex((p) => p.id === id);
      if (existingIdx >= 0) {
        pitches[existingIdx] = { ...pitches[existingIdx], ...newPitch, updated_at: now };
      } else {
        pitches.unshift(newPitch);
      }
      localStorage.setItem(STORAGE_KEYS.PITCHES, JSON.stringify(pitches));
    }

    return newPitch;
  },

  async deletePitch(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        await supabase.from('pitches').delete().eq('id', id);
      }
    }

    if (typeof window !== 'undefined') {
      const pitches = await this.getPitches();
      const filtered = pitches.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.PITCHES, JSON.stringify(filtered));
    }
    return true;
  },

  // --- PRACTICE SESSIONS ---
  async getSessions(): Promise<PracticeSession[]> {
    if (typeof window === 'undefined') return INITIAL_SESSIONS;

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('practice_sessions')
          .select('*, feedback:pitch_feedback(*)')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((s) => ({
            ...s,
            feedback: Array.isArray(s.feedback) ? s.feedback[0] : s.feedback,
          })) as PracticeSession[];
        }
      }
    }

    ensureLocalStorageInitialized();
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return raw ? JSON.parse(raw) : INITIAL_SESSIONS;
  },

  async getSessionById(id: string): Promise<PracticeSession | null> {
    const sessions = await this.getSessions();
    return sessions.find((s) => s.id === id) || null;
  },

  async saveSession(session: Omit<PracticeSession, 'id' | 'created_at'> & { id?: string }): Promise<PracticeSession> {
    const id = session.id || 'session-' + Date.now();
    const now = new Date().toISOString();
    const newSession: PracticeSession = {
      id,
      user_id: session.user_id || 'local-user',
      pitch_id: session.pitch_id || null,
      pitch_title: session.pitch_title,
      category: session.category,
      script_used: session.script_used,
      target_duration_seconds: session.target_duration_seconds,
      actual_duration_seconds: session.actual_duration_seconds,
      status: session.status || 'Completed',
      started_at: session.started_at || now,
      completed_at: session.completed_at || now,
      created_at: now,
      feedback: session.feedback,
    };

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        const payload = {
          id: newSession.id,
          user_id: user?.id || newSession.user_id,
          pitch_id: newSession.pitch_id,
          pitch_title: newSession.pitch_title,
          category: newSession.category,
          script_used: newSession.script_used,
          target_duration_seconds: newSession.target_duration_seconds,
          actual_duration_seconds: newSession.actual_duration_seconds,
          status: newSession.status,
          started_at: newSession.started_at,
          completed_at: newSession.completed_at,
        };
        await supabase.from('practice_sessions').upsert(payload);
      }
    }

    if (typeof window !== 'undefined') {
      ensureLocalStorageInitialized();
      const sessions = await this.getSessions();
      const existingIdx = sessions.findIndex((s) => s.id === id);
      if (existingIdx >= 0) {
        sessions[existingIdx] = { ...sessions[existingIdx], ...newSession };
      } else {
        sessions.unshift(newSession);
      }
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    }

    return newSession;
  },

  async deleteSession(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        await supabase.from('practice_sessions').delete().eq('id', id);
      }
    }

    if (typeof window !== 'undefined') {
      const sessions = await this.getSessions();
      const filtered = sessions.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
    }
    return true;
  },

  // --- FEEDBACK ---
  async saveFeedback(feedback: PitchFeedback): Promise<PitchFeedback> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('pitch_feedback').upsert({
          ...feedback,
          user_id: user?.id || feedback.user_id,
        });
        // Update session status to Analyzed
        await supabase
          .from('practice_sessions')
          .update({ status: 'Analyzed' })
          .eq('id', feedback.session_id);
      }
    }

    if (typeof window !== 'undefined') {
      const sessions = await this.getSessions();
      const sIdx = sessions.findIndex((s) => s.id === feedback.session_id);
      if (sIdx >= 0) {
        sessions[sIdx].feedback = feedback;
        sessions[sIdx].status = 'Analyzed';
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      }
    }

    return feedback;
  },

  // --- DASHBOARD AGGREGATED METRICS ---
  async getDashboardStats(): Promise<DashboardStats> {
    const sessions = await this.getSessions();
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalPracticeTimeSeconds: 0,
        avgDurationSeconds: 0,
        avgScore: null,
        scoreImprovement: null,
        durationPacingRate: 0,
      };
    }

    const totalSessions = sessions.length;
    const totalPracticeTimeSeconds = sessions.reduce((acc, s) => acc + s.actual_duration_seconds, 0);
    const avgDurationSeconds = Math.round(totalPracticeTimeSeconds / totalSessions);

    // AI score calculation
    const analyzedSessions = sessions.filter((s) => s.feedback && typeof s.feedback.overall_score === 'number');
    let avgScore: number | null = null;
    let scoreImprovement: number | null = null;

    if (analyzedSessions.length > 0) {
      const sum = analyzedSessions.reduce((acc, s) => acc + s.feedback!.overall_score, 0);
      avgScore = Math.round(sum / analyzedSessions.length);

      // Compare latest session to earlier average if we have >= 2 analyzed sessions
      if (analyzedSessions.length >= 2) {
        const latest = analyzedSessions[0].feedback!.overall_score;
        const previousAverage =
          analyzedSessions.slice(1).reduce((acc, s) => acc + s.feedback!.overall_score, 0) /
          (analyzedSessions.length - 1);
        scoreImprovement = Math.round(((latest - previousAverage) / previousAverage) * 100);
      }
    }

    // Pacing rate: % of sessions within +-10% of target duration
    const onTargetCount = sessions.filter((s) => {
      const diff = Math.abs(s.actual_duration_seconds - s.target_duration_seconds);
      return (diff / s.target_duration_seconds) <= 0.10;
    }).length;
    const durationPacingRate = Math.round((onTargetCount / totalSessions) * 100);

    return {
      totalSessions,
      totalPracticeTimeSeconds,
      avgDurationSeconds,
      avgScore,
      scoreImprovement,
      durationPacingRate,
    };
  },

  // --- RESET / SEED HELPERS ---
  resetToDemoData(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PITCHES, JSON.stringify(INITIAL_PITCHES));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  },

  clearAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PITCHES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
  },
};
