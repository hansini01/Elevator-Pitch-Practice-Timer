import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PitchPerfect AI — Elevator Pitch Practice Timer',
  description:
    'Practice smarter. Speak confidently. Make every second count. AI-powered elevator pitch timer with real-time feedback and performance analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
