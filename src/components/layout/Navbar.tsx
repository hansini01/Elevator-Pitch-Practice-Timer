'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Mic,
  Timer,
  LayoutDashboard,
  Sparkles,
  Bookmark,
  History,
  TrendingUp,
  Settings,
  Menu,
  X,
  Play,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { StorageAPI } from '@/lib/storage';
import { UserProfile } from '@/lib/types';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isCloud, setIsCloud] = useState(false);

  useEffect(() => {
    setIsCloud(isSupabaseConfigured());
    StorageAPI.getProfile().then(setUserProfile);
  }, []);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Practice Timer', href: '/practice', icon: Timer },
    { label: 'AI Generator', href: '/generator', icon: Sparkles },
    { label: 'My Pitches', href: '/pitches', icon: Bookmark },
    { label: 'History', href: '/history', icon: History },
    { label: 'Progress', href: '/progress', icon: TrendingUp },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-950 tracking-tight flex items-center gap-1.5">
                  PitchPerfect <span className="text-indigo-600 text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100">AI</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                  Elevator Pitch Practice Timer
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Quick Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions: Practice button & Status */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Cloud or Demo indicator */}
            <Link href="/settings" title="View Database Status">
              <Badge variant={isCloud ? 'success' : 'slate'} size="sm">
                {isCloud ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Supabase Live
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Local Demo Mode
                  </>
                )}
              </Badge>
            </Link>

            <Link href="/practice">
              <Button size="sm" variant="primary" icon={<Play className="w-3.5 h-3.5 fill-current" />}>
                Practice Pitch
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link href="/practice">
              <Button size="sm" variant="primary" className="text-xs px-2.5 py-1">
                <Play className="w-3 h-3 fill-current mr-1" /> Practice
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5 text-indigo-600" />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              User: <span className="font-semibold text-slate-700">{userProfile?.display_name || 'Alex Morgan'}</span>
            </div>
            <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
              <Badge variant={isCloud ? 'success' : 'slate'} size="sm">
                {isCloud ? 'Supabase Connected' : 'Local Demo'}
              </Badge>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
