'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { PracticeTimer } from '@/components/timer/PracticeTimer';
import { PitchCategory } from '@/lib/types';
import { Loader2 } from 'lucide-react';

function PracticeContent() {
  const searchParams = useSearchParams();

  const title = searchParams.get('title') || 'Elevator Pitch Practice';
  const category = (searchParams.get('category') as PitchCategory) || 'Job Interview';
  const script = searchParams.get('script') || '';
  const target = Number(searchParams.get('target')) || 60;
  const pitchId = searchParams.get('pitchId') || null;

  return (
    <PracticeTimer
      initialPitchTitle={title}
      initialCategory={category}
      initialScript={script}
      initialTargetDuration={target}
      pitchId={pitchId}
    />
  );
}

export default function PracticePage() {
  return (
    <AppLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        }
      >
        <PracticeContent />
      </Suspense>
    </AppLayout>
  );
}
