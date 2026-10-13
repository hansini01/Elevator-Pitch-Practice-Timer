'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { StorageAPI } from '@/lib/storage';
import { Mic, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        if (supabase) {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
        }
      } else {
        // Local preview sign in
        await StorageAPI.saveProfile({
          email,
          display_name: email.split('@')[0] || 'Alex Morgan',
        });
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid login credentials.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantWorkshopLogin = async () => {
    setIsLoading(true);
    await StorageAPI.saveProfile({
      email: 'alex.morgan@pitchperfect.ai',
      display_name: 'Alex Morgan (Workshop Attendee)',
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Mic className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-slate-950 tracking-tight">
            PitchPerfect <span className="text-indigo-600">AI</span>
          </span>
        </Link>
        <h2 className="mt-6 text-2xl font-bold text-slate-900 tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Track practice history, save pitch drafts, and receive AI evaluations.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Quick Demo Login button */}
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Workshop Quick Evaluation Access
              </div>
              <p className="text-[11px] text-indigo-700/80 mb-3 leading-relaxed">
                Evaluating the project? Click below to instantly log in with pre-seeded pitches and practice history:
              </p>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleInstantWorkshopLogin}
                className="w-full text-xs py-2 shadow-xs"
              >
                1-Click Workshop Demo Sign In
              </Button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-3 text-slate-400 text-xs uppercase tracking-wider">
                Or sign in with email
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="secondary"
                size="md"
                isLoading={isLoading}
                className="w-full justify-center text-sm font-semibold py-2.5"
              >
                Sign In
              </Button>
            </form>

            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-indigo-600 font-semibold hover:underline">
                Sign up free
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
