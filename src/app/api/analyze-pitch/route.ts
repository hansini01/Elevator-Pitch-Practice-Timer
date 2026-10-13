import { NextRequest, NextResponse } from 'next/server';
import { analyzePitchAI, isGeminiConfigured } from '@/lib/gemini';
import { AnalysisInput } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalysisInput;

    if (!body.script || body.script.trim().length < 5) {
      return NextResponse.json(
        { error: 'A valid pitch script or transcript (at least 5 characters) is required for AI evaluation.' },
        { status: 400 }
      );
    }

    const result = await analyzePitchAI({
      script: body.script.trim(),
      pitch_title: body.pitch_title || 'Elevator Pitch Practice',
      category: body.category || 'Custom',
      target_duration_seconds: Number(body.target_duration_seconds) || 60,
      actual_duration_seconds: Number(body.actual_duration_seconds) || 60,
    });

    return NextResponse.json({
      success: true,
      data: result,
      isLiveGemini: isGeminiConfigured(),
      notice:
        'PitchPerfect AI evaluates textual structure, hook power, clarity, and pacing. It does not evaluate physical audio acoustic delivery or body language.',
    });
  } catch (err: unknown) {
    console.error('API analyze-pitch error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to analyze pitch';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
