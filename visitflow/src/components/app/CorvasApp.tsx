'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, House, LifeBuoy, MessageCircleMore, Pill, Route } from 'lucide-react';
import { BottomNavItem } from '@/components/app/ui';
import { InstallPromptCard } from '@/components/app/InstallPromptCard';
import { AskScreen } from '@/components/app/screens/AskScreen';
import { MedicationsScreen } from '@/components/app/screens/MedicationsScreen';
import { RecoveryScreen } from '@/components/app/screens/RecoveryScreen';
import { SupportScreen } from '@/components/app/screens/SupportScreen';
import { TodayScreen } from '@/components/app/screens/TodayScreen';
import { OnboardingFlow } from '@/components/app/OnboardingFlow';
import { buildUrgentEscalationSummary, getTodaysCheckIn } from '@/lib/corvas-logic';
import { useAppStore } from '@/lib/store';
import type { AppTab } from '@/lib/types';

const NAV_ITEMS: Array<{ tab: AppTab; label: string; icon: typeof House }> = [
  { tab: 'today', label: 'Today', icon: House },
  { tab: 'ask', label: 'Ask', icon: MessageCircleMore },
  { tab: 'recovery', label: 'Recovery', icon: Route },
  { tab: 'medications', label: 'Meds', icon: Pill },
  { tab: 'support', label: 'Support', icon: LifeBuoy },
];

function mapLegacyView(view?: string | null): AppTab | null {
  if (!view) return null;
  if (view === 'medications') return 'medications';
  if (view === 'rehab') return 'recovery';
  if (view === 'messages' || view === 'peers') return 'support';
  if (view === 'pre-visit') return 'today';
  if (view === 'documents' || view === 'live-visit' || view === 'post-visit') return 'ask';
  return 'today';
}

function AppFrame({ activeTab }: { activeTab: AppTab }) {
  switch (activeTab) {
    case 'ask':
      return <AskScreen />;
    case 'recovery':
      return <RecoveryScreen />;
    case 'medications':
      return <MedicationsScreen />;
    case 'support':
      return <SupportScreen installCard={<InstallPromptCard />} />;
    case 'today':
    default:
      return <TodayScreen />;
  }
}

export function CorvasApp({ initialView }: { initialView?: string | null }) {
  const {
    hydrated,
    onboarding,
    activeTab,
    patient,
    contacts,
    recoveryWeeks,
    symptomCheckIns,
    escalations,
    sodiumBudgetMg,
    mealLogs,
    medications,
    setHydrated,
    setActiveTab,
    sendEscalationOutreach,
    markUrgentEscalationHandled,
    updateOnboarding,
    lastUrgentEscalationKey,
    lastDailyBriefRefresh,
    updateDailyBriefRefreshTime,
  } = useAppStore();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setHydrated(true);
  }, [setHydrated]);

  useEffect(() => {
    const mapped = mapLegacyView(initialView);
    if (mapped) {
      setActiveTab(mapped);
    }
  }, [initialView, setActiveTab]);

  useEffect(() => {
    const applyMode = () => {
      document.documentElement.dataset.largeText = onboarding.largeText ? 'true' : 'false';
    };
    applyMode();
  }, [onboarding.largeText]);

  useEffect(() => {
    const updateStatus = () => setOnline(window.navigator.onLine);
    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Quiet fallback. The app still works without service worker registration.
    });
  }, []);

  useEffect(() => {
    const topEscalation = escalations[0];
    if (!topEscalation || topEscalation.tier !== 'urgent') {
      return;
    }

    const escalationKey = `${topEscalation.tier}:${topEscalation.title}:${topEscalation.message}`;
    if (lastUrgentEscalationKey === escalationKey) {
      return;
    }

    const latestCheckIn = getTodaysCheckIn(symptomCheckIns) ?? symptomCheckIns[0];
    const locationLabel = onboarding.shareLocationForAlerts ? onboarding.locationLabel : undefined;
    const summary = buildUrgentEscalationSummary({
      patientName: patient.preferredName,
      event: topEscalation,
      latestCheckIn: latestCheckIn ?? undefined,
      locationLabel,
    });

    const caregiver =
      contacts.find((contact) => contact.id === onboarding.emergencyContactId)
      ?? contacts.find((contact) => contact.role === 'family');
    const careTeam = contacts.find((contact) => contact.role === 'care-team');

    let sentAny = false;

    if (onboarding.caregiverUpdates && caregiver) {
      sendEscalationOutreach({
        contactId: caregiver.id,
        summary,
        source: 'auto-caregiver',
      });
      sentAny = true;
    }

    if (onboarding.autoAlertCareTeam && careTeam) {
      sendEscalationOutreach({
        contactId: careTeam.id,
        summary,
        source: 'auto-care-team',
      });
      sentAny = true;
    }

    if (sentAny) {
      markUrgentEscalationHandled(escalationKey);
    }
  }, [
    contacts,
    escalations,
    lastUrgentEscalationKey,
    markUrgentEscalationHandled,
    onboarding.autoAlertCareTeam,
    onboarding.caregiverUpdates,
    onboarding.emergencyContactId,
    onboarding.locationLabel,
    onboarding.shareLocationForAlerts,
    patient.preferredName,
    sendEscalationOutreach,
    symptomCheckIns,
  ]);

  // Refresh daily brief if last refresh was >6 hours ago
  useEffect(() => {
    const refreshDailyBrief = async () => {
      if (!online) return;

      const now = new Date();
      const lastRefresh = lastDailyBriefRefresh ? new Date(lastDailyBriefRefresh) : null;
      const sixHoursMs = 6 * 60 * 60 * 1000;

      if (lastRefresh && now.getTime() - lastRefresh.getTime() < sixHoursMs) {
        return; // Recently refreshed
      }

      try {
        const todaysMeals = mealLogs.filter(
          (meal) => new Date(meal.createdAt).toDateString() === new Date().toDateString()
        );
        const todaysSodium = todaysMeals.reduce((sum, meal) => sum + meal.sodiumMg, 0);
        const sodiumRemaining = Math.max(0, sodiumBudgetMg - todaysSodium);
        const todaysCheckIn = symptomCheckIns[0];

        const response = await fetch('/api/daily-brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientName: patient.preferredName,
            recoveryWeek: patient.programWeek,
            recentMoodScore: todaysCheckIn?.worry ?? 2,
            sodiumBudgetRemaining: sodiumRemaining,
          }),
        });

        if (response.ok) {
          const brief = await response.json();
          updateOnboarding({
            ...onboarding,
          });
          // In a real app, we would update dailyBrief in store
          updateDailyBriefRefreshTime(now.toISOString());
        }
      } catch (error) {
        console.error('Error refreshing daily brief:', error);
      }
    };

    refreshDailyBrief();
  }, [online, lastDailyBriefRefresh, mealLogs, sodiumBudgetMg, symptomCheckIns, patient, onboarding, updateOnboarding, updateDailyBriefRefreshTime]);

  // Background reminders - check every minute for due reminders
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.serviceWorker.controller) return;

    const checkReminders = async () => {
      try {
        // Import background task logic
        const { generateDailyReminders } = await import('@/lib/background-tasks');

        const medicationNames = medications
          .filter((m) => m.doses.some((d) => d.status === 'due'))
          .map((m) => m.name.split(' ')[0]);

        const lastCheckIn = symptomCheckIns[0];
        const daysSinceCheckIn = lastCheckIn
          ? (Date.now() - new Date(lastCheckIn.createdAt).getTime()) / (24 * 60 * 60 * 1000)
          : 1;

        const reminders = generateDailyReminders({
          patientName: patient.preferredName,
          medicationNames,
          hasWorkoutToday: true, // Simplified - in real app check actual workout schedule
          lastCheckInDaysAgo: Math.floor(daysSinceCheckIn),
        });

        // Send to service worker to check if any are due
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CHECK_REMINDERS',
            reminders,
          });
        }
      } catch (error) {
        // Silently fail - don't log in production
      }
    };

    // Check every minute
    const interval = setInterval(checkReminders, 60 * 1000);
    checkReminders(); // Check immediately on load

    return () => clearInterval(interval);
  }, [patient, medications, symptomCheckIns]);


  const title = useMemo(() => NAV_ITEMS.find((item) => item.tab === activeTab)?.label ?? 'Today', [activeTab]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f7fbfb,#f0f5f4)] px-6">
        <div className="rounded-[28px] border border-white/80 bg-white/90 px-6 py-5 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-lg font-semibold text-slate-900">Loading CorVas…</p>
          <p className="mt-2 text-base text-slate-600">Bringing back your recovery plan on this device.</p>
        </div>
      </div>
    );
  }

  if (!onboarding.completed) {
    return <OnboardingFlow />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff9ef,transparent_36%),linear-gradient(180deg,#f6fbfb,#edf4f3)] pb-28">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 sm:px-6 sm:py-6">
        <header className="sticky top-0 z-30 mb-6 rounded-[28px] border border-white/80 bg-white/88 px-4 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--color-panel-highlight)] text-[var(--color-teal-deep)]">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-slate-950">CorVas</p>
                <p className="text-sm text-slate-600">{title}</p>
              </div>
            </div>
            <div className="rounded-full bg-[var(--color-panel-soft)] px-4 py-2 text-sm font-semibold text-slate-700">
              Saved on this device
            </div>
          </div>

          {!online ? (
            <div className="mt-4 rounded-[20px] bg-amber-50 px-4 py-3 text-base leading-7 text-amber-900">
              You are offline. You can still review today, log medications, write notes, and keep using the app.
            </div>
          ) : (
            <div className="mt-4 rounded-[20px] bg-[var(--color-panel-soft)] px-4 py-3 text-base leading-7 text-slate-700">
              Recovery is easier one step at a time. The app is keeping things simple for today.
            </div>
          )}
        </header>

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <AppFrame activeTab={activeTab} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/75 bg-white/92 px-3 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl gap-2">
          {NAV_ITEMS.map((item) => (
            <BottomNavItem
              key={item.tab}
              icon={item.icon}
              label={item.label}
              active={item.tab === activeTab}
              onClick={() => setActiveTab(item.tab)}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
