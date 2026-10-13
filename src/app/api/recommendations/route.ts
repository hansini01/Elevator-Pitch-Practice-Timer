import { NextRequest, NextResponse } from 'next/server';
import { getPersonalizedRecommendationsAI, isGeminiConfigured } from '@/lib/gemini';
import { PracticeSession } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { sessions: PracticeSession[] };
    const sessions = Array.isArray(body.sessions) ? body.sessions : [];

    const result = await getPersonalizedRecommendationsAI(sessions);

    return NextResponse.json({
      success: true,
      data: result,
      isLiveGemini: isGeminiConfigured(),
    });
  } catch (err: unknown) {
    console.error('API recommendations error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to generate recommendations';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
