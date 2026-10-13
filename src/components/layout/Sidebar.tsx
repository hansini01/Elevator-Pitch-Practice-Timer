'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Timer,
  Sparkles,
  Bookmark,
  History,
  TrendingUp,
  Settings,
  Mic,
  Play,
  CheckCircle2,
  Database,
  Shield,
  Layers,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { StorageAPI } from '@/lib/storage';
import { UserProfile } from '@/lib/types';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isCloud, setIsCloud] = useState(false);

  useEffect(() => {
    setIsCloud(isSupabaseConfigured());
    StorageAPI.getProfile().then(setUserProfile);
  }, []);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Practice Timer', href: '/practice', icon: Timer, highlight: true },
    { label: 'AI Pitch Generator', href: '/generator', icon: Sparkles },
    { label: 'My Pitches', href: '/pitches', icon: Bookmark },
    { label: 'Session History', href: '/history', icon: History },
    { label: 'Progress & Trends', href: '/progress', icon: TrendingUp },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 h-screen sticky top-0 shrink-0">
      {/* Brand header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
              PitchPerfect <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded font-bold border border-indigo-100">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Elevator Pitch Coach</p>
          </div>
        </Link>
      </div>

      {/* Quick Action Button */}
      <div className="p-4">
        <Link href="/practice" className="block">
          <Button
            variant="primary"
            className="w-full justify-center shadow-md shadow-indigo-200/50 py-2.5 font-semibold text-sm"
            icon={<Play className="w-4 h-4 fill-current" />}
          >
            Start Practice
          </Button>
        </Link>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.highlight && !isActive && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Database & Cloud Status Card */}
      <div className="p-3 mx-3 my-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-600" /> Storage
          </span>
          <Badge variant={isCloud ? 'success' : 'slate'} size="sm">
            {isCloud ? 'Supabase' : 'Local Preview'}
          </Badge>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {isCloud
            ? 'Synced with Supabase Cloud.'
            : 'Data saved locally. Add Supabase keys to sync cloud.'}
        </p>
      </div>

      {/* Footer User Profile */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-indigo-800 text-white font-semibold flex items-center justify-center text-xs shrink-0 shadow-sm">
            {(userProfile?.display_name || 'A')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {userProfile?.display_name || 'Alex Morgan'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {userProfile?.email || 'Practitioner'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
