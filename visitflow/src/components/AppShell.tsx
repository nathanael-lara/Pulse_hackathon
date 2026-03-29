'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Activity, Calendar, MessageSquare, FileText,
  Pill, Users, LayoutDashboard, Radio, ChevronRight
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { RiskBadge } from './RiskBadge';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'pre-visit', label: 'Pre-Visit', icon: Calendar },
  { id: 'live-visit', label: 'Live Visit', icon: Radio, highlight: true },
  { id: 'post-visit', label: 'Post-Visit', icon: FileText },
  { id: 'rehab', label: 'Rehab', icon: Activity },
  { id: 'medications', label: 'Medications', icon: Pill },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'peers', label: 'Peer Support', icon: Users },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { activeView, setActiveView, riskLevel, patient, currentHR, currentSteps } = useAppStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border flex flex-col glass-card">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary heartbeat" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">VisitFlow</div>
              <div className="text-xs text-muted-foreground">Cardiac Care AI</div>
            </div>
          </div>
        </div>

        {/* Patient card */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl glass">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
              {patient.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{patient.name}</div>
              <div className="text-xs text-muted-foreground">Week {patient.rehabWeek} · Day {patient.rehabDay}</div>
            </div>
            <RiskBadge level={riskLevel} compact />
          </div>
        </div>

        {/* Vitals strip */}
        <div className="px-4 py-3 border-b border-border grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg glass text-center">
            <div className="text-xs text-muted-foreground">Heart Rate</div>
            <div className="text-lg font-bold text-primary leading-none mt-0.5">{currentHR}</div>
            <div className="text-xs text-muted-foreground">BPM</div>
          </div>
          <div className="p-2 rounded-lg glass text-center">
            <div className="text-xs text-muted-foreground">Steps</div>
            <div className="text-lg font-bold text-primary leading-none mt-0.5">{currentSteps.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group',
                  isActive
                    ? 'bg-primary/15 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
                  item.highlight && !isActive && 'border border-primary/20 text-primary/80'
                )}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', item.highlight && !isActive && 'text-primary')} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.highlight && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
                {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom streak */}
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Heart className="w-3.5 h-3.5 text-red-400" />
            <span>{patient.streakDays}-day streak</span>
            <span className="ml-auto text-primary font-medium">→ Keep going</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex-1 overflow-y-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
