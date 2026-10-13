import { NextRequest, NextResponse } from 'next/server';
import { generatePitchAI, isGeminiConfigured } from '@/lib/gemini';
import { GeneratorInput } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GeneratorInput;

    if (!body.topic || !body.purpose || !body.target_audience) {
      return NextResponse.json(
        { error: 'Topic, purpose, and target audience are required.' },
        { status: 400 }
      );
    }

    const duration = Number(body.target_duration_seconds) || 60;
    if (duration < 15 || duration > 300) {
      return NextResponse.json(
        { error: 'Target duration must be between 15 and 300 seconds.' },
        { status: 400 }
      );
    }

    const result = await generatePitchAI({
      ...body,
      target_duration_seconds: duration,
    });

    return NextResponse.json({
      success: true,
      data: result,
      isLiveGemini: isGeminiConfigured(),
    });
  } catch (err: unknown) {
    console.error('API generate-pitch error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to generate pitch';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
