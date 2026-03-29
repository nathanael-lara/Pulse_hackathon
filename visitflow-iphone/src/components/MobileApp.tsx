'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Calendar,
  Car,
  CheckCircle2,
  ChevronRight,
  Heart,
  Menu,
  Mic,
  Pill,
  Radio,
  ShieldAlert,
  Stethoscope,
  Users,
} from 'lucide-react';
import { MEDICATIONS, REHAB_HISTORY, VISIT_BULLETS, VISIT_LINES } from '@/lib/mock-data';
import type { TabId, VisitLine } from '@/lib/types';

const TABS: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'home', label: 'Record', icon: Heart },
  { id: 'visit', label: 'Visit', icon: Radio },
  { id: 'meds', label: 'Medication', icon: Pill },
  { id: 'rehab', label: 'Rehab', icon: Stethoscope },
  { id: 'support', label: 'Support', icon: Users },
];

function AppHeader() {
  return (
    <div className="safe-top border-b border-[#e7e0ef] bg-white px-4 pb-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#8f71b8]/14 flex items-center justify-center">
            <Heart className="h-4 w-4 text-[#8f71b8]" />
          </div>
          <div className="leading-none">
            <div className="text-[1.55rem] font-semibold tracking-tight text-[#7754a2]">
              Jinga<span className="font-normal text-[#8d8d98]">Life</span>
            </div>
            <div className="mt-1 text-xs tracking-[0.18em] uppercase text-[#9c95a7]">Senior care record</div>
          </div>
        </div>
        <button className="h-11 w-11 rounded-2xl border border-[#e7e0ef] bg-white flex items-center justify-center">
          <Menu className="h-5 w-5 text-[#8f71b8]" />
        </button>
      </div>
    </div>
  );
}

function ProfileHero() {
  return (
    <div className="mx-4 mt-4 rounded-[28px] border border-[#ece6f3] bg-white p-5 shadow-[0_8px_24px_rgba(120,95,160,0.08)]">
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#f1edf6] bg-[linear-gradient(135deg,#d8c8ea,#f5f1fa)] text-2xl font-semibold text-[#7754a2]">
          M
        </div>
        <div className="text-[1.6rem] font-medium text-[#585566]">Maria Santos</div>
        <div className="mt-1 text-base text-[#8a8795]">Week 3 cardiac recovery</div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { title: 'Medication', count: '2', date: 'Today', icon: Pill },
          { title: 'Medical Issues', count: '3', date: 'Updated', icon: Stethoscope },
          { title: 'Alerts', count: '1', date: 'Active', icon: Bell },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-[22px] border border-[#ece6f3] bg-[#faf8fc] px-2 py-4 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#a486ca] text-[#8f71b8]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-[#8f71b8]">{item.title}</div>
              <div className="mt-1 text-lg font-semibold text-[#585566]">{item.count}</div>
              <div className="text-sm text-[#9993a4]">{item.date}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8f71b8]">{title}</div>
      {action && (
        <button className="rounded-xl bg-[#b8d97b] px-3 py-2 text-sm font-semibold text-white">
          {action}
        </button>
      )}
    </div>
  );
}

function HomeTab() {
  return (
    <div className="pb-28">
      <ProfileHero />

      <div className="mx-4 mt-5 rounded-[28px] border border-[#ece6f3] bg-white p-4 shadow-[0_8px_24px_rgba(120,95,160,0.08)]">
        <SectionHeader title="My health record" />
        <div className="space-y-2">
          {[
            ['Medication', '2 medicines need review', Pill],
            ['Allergies', 'No new allergy alerts', ShieldAlert],
            ['Medical conditions', 'Mild arrhythmia, post-MI recovery', Stethoscope],
            ['Documents', 'Visit summary and labs available', Calendar],
            ['Family & friends', 'Support circle is active', Users],
          ].map(([title, subtitle, Icon]) => {
            const ItemIcon = Icon as React.ComponentType<{ className?: string }>;
            return (
              <button key={title} className="flex w-full items-center gap-4 rounded-[22px] bg-[#8f71b8] px-4 py-4 text-left text-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35">
                  <ItemIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-[1.03rem] font-medium">{title}</div>
                  <div className="mt-1 text-sm text-white/78">{subtitle}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-white/80" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-4 mt-5 rounded-[28px] border border-[#ece6f3] bg-white p-4 shadow-[0_8px_24px_rgba(120,95,160,0.08)]">
        <SectionHeader title="Vitals" />
        <div className="rounded-[22px] border border-[#ece6f3] bg-[#faf8fc] p-4">
          <div className="flex items-center gap-2 text-[#9dc96b]">
            <Heart className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-[0.18em]">Heart rate</span>
          </div>
          <div className="mt-3 text-center">
            <div className="text-[4.5rem] font-semibold leading-none text-[#4e4c58]">74</div>
            <div className="mt-2 text-lg tracking-[0.16em] uppercase text-[#8f71b8]">beats/min.</div>
          </div>
          <div className="mt-5 h-16 rounded-[18px] bg-[linear-gradient(180deg,#ffffff,#f7f1fb)] px-3 py-4">
            <div className="h-full w-full rounded-full border-b-4 border-[#8f71b8]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function VisitTab() {
  const [selected, setSelected] = useState<VisitLine>(VISIT_LINES[0]);
  const bullets = useMemo(
    () => VISIT_BULLETS[selected.id] ?? ['Tap any line to see a simple explanation in large, readable bullet points.'],
    [selected]
  );

  return (
    <div className="space-y-4 px-4 pb-28 pt-4">
      <div className="rounded-[28px] bg-[#8f71b8] px-5 py-5 text-white shadow-[0_8px_24px_rgba(120,95,160,0.16)]">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/35 bg-white/10">
            <Mic className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[1.1rem] font-medium">Live visit</div>
            <div className="mt-1 text-sm text-white/82">Tap what the doctor said and see it explained clearly</div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#ece6f3] bg-white p-4 shadow-[0_8px_24px_rgba(120,95,160,0.08)]">
        <SectionHeader title="Transcript" />
        <div className="space-y-3">
          {VISIT_LINES.map((line) => (
            <button
              key={line.id}
              onClick={() => setSelected(line)}
              className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                selected.id === line.id
                  ? 'border-[#a486ca] bg-[#f4eff9]'
                  : 'border-[#ece6f3] bg-white'
              }`}
            >
              <div className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#9c95a7]">
                {line.speaker === 'doctor' ? 'Doctor' : line.speaker === 'ai' ? 'AI' : 'Patient'}
              </div>
              <div className="text-[1.06rem] leading-7 text-[#4f4b58]">{line.text}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-[#ece6f3] bg-white p-4 shadow-[0_8px_24px_rgba(120,95,160,0.08)]">
        <SectionHeader title="What did he just say?" />
        <div className="space-y-3">
          {bullets.map((bullet) => (
            <div key={bullet} className="flex gap-3 rounded-[22px] border border-[#ece6f3] bg-[#faf8fc] p-4">
              <div className="pt-1 text-xl text-[#8f71b8]">•</div>
              <div className="text-[1.02rem] leading-7 text-[#5e5968]">{bullet}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {['Explain simply', 'Go deeper', 'Ask next question', 'Save'].map((action, index) => (
            <button
              key={action}
              className={index === 0
                ? 'rounded-[18px] bg-[#8f71b8] px-3 py-4 text-[0.98rem] font-medium text-white'
                : 'rounded-[18px] border border-[#e6dfef] bg-[#faf8fc] px-3 py-4 text-[0.98rem] font-medium text-[#7754a2]'
              }
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MedsTab() {
  return (
    <div className="space-y-4 px-4 pb-28 pt-4">
      <div className="rounded-[28px] bg-[#8f71b8] px-5 py-5 text-white shadow-[0_8px_24px_rgba(120,95,160,0.16)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/35 bg-white/10">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[1.1rem] font-medium">Medications</div>
              <div className="mt-1 text-sm text-white/82">Large, simple reminders and easy action buttons</div>
            </div>
          </div>
          <button className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#8f71b8]">ADD +</button>
        </div>
      </div>

      {MEDICATIONS.map((med) => (
        <div key={med.id} className="rounded-[28px] border border-[#ece6f3] bg-white p-5 shadow-[0_8px_24px_rgba(120,95,160,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[1.25rem] font-medium text-[#5a5663]">{med.name}</div>
              <div className="mt-2 text-base text-[#8c8699]">{med.dose}</div>
            </div>
            <div className={`rounded-full px-3 py-2 text-sm font-medium ${
              med.status === 'taken'
                ? 'bg-[#e7f5ee] text-[#2c9f6e]'
                : med.status === 'missed'
                  ? 'bg-[#fdeceb] text-[#d05b54]'
                  : 'bg-[#f1edf6] text-[#8f71b8]'
            }`}>
              {med.status.toUpperCase()}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#f0ebf5] pt-4">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9c95a7]">Reminder</div>
              <div className="mt-2 text-[1.05rem] text-[#5a5663]">{med.time}</div>
            </div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9c95a7]">Currently taking</div>
              <div className="mt-2 text-[1.05rem] text-[#5a5663]">{med.status === 'taken' ? 'Yes' : 'No'}</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button className="rounded-[18px] bg-[#8f71b8] px-3 py-4 text-[1rem] font-medium text-white">Mark taken</button>
            <button className="rounded-[18px] border border-[#e6dfef] bg-[#faf8fc] px-3 py-4 text-[1rem] font-medium text-[#7754a2]">Add to calendar</button>
          </div>
        </div>
      ))}

      <div className="rounded-[28px] border border-[#f5d6d2] bg-white p-5 shadow-[0_8px_24px_rgba(120,95,160,0.08)]">
        <div className="mb-3 flex items-center gap-2 text-[#d05b54]">
          <ShieldAlert className="h-5 w-5" />
          <div className="text-[1.05rem] font-medium">Important reminder</div>
        </div>
        <div className="text-[1.03rem] leading-7 text-[#6a6475]">
          Maria missed 2 doses today. Please check on her.
        </div>
      </div>
    </div>
  );
}

function RehabTab() {
  return (
    <div className="space-y-4 px-4 pb-28 pt-4">
      <div className="rounded-[28px] border border-[#ece6f3] bg-white p-5 shadow-[0_8px_24px_rgba(120,95,160,0.08)]">
        <SectionHeader title="Today&apos;s rehab" />
        <div className="space-y-3">
          {['Morning breathing', '15-minute walk', 'Evening stretch'].map((item, index) => (
            <div key={item} className="flex items-center gap-3 rounded-[22px] border border-[#ece6f3] bg-[#faf8fc] px-4 py-4">
              {index === 0 ? <CheckCircle2 className="h-5 w-5 text-[#8fd18d]" /> : <ChevronRight className="h-5 w-5 text-[#9c95a7]" />}
              <div className="text-[1.03rem] text-[#555260]">{item}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] bg-[#8f71b8] px-5 py-5 text-white shadow-[0_8px_24px_rgba(120,95,160,0.16)]">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/78">Cardio stress feedback</div>
        <div className="mt-3 text-[1.18rem] leading-8">
          Your heart rate is high for this pace. Slow down and rest for a moment.
        </div>
      </div>

      <div className="rounded-[28px] border border-[#ece6f3] bg-white p-5 shadow-[0_8px_24px_rgba(120,95,160,0.08)]">
        <SectionHeader title="Backlog history" />
        <div className="space-y-2">
          {REHAB_HISTORY.map((entry) => (
            <div key={entry.day} className="rounded-[22px] border border-[#ece6f3] bg-[#faf8fc] px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="text-[1.02rem] font-medium text-[#555260]">{entry.day}</div>
                <div className="text-sm uppercase tracking-[0.14em] text-[#9c95a7]">{entry.status}</div>
              </div>
              <div className="mt-2 text-base text-[#8b8695]">{entry.steps.toLocaleString()} steps • avg HR {entry.avgHR}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SupportTab() {
  return (
    <div className="space-y-4 px-4 pb-28 pt-4">
      <div className="rounded-[28px] border border-[#ece6f3] bg-white p-5 shadow-[0_8px_24px_rgba(120,95,160,0.08)]">
        <SectionHeader title="Family & friends" action="ADD +" />
        <div className="rounded-[22px] bg-[#8f71b8] p-4 text-white">
          <div className="text-[1.05rem] font-medium">Recovery companions</div>
          <div className="mt-2 text-base leading-7 text-white/82">
            Trusted supporters can help with reminders, encouragement, and daily check-ins.
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#ece6f3] bg-white p-5 shadow-[0_8px_24px_rgba(120,95,160,0.08)]">
        <SectionHeader title="Community transport" />
        <div className="space-y-3">
          <div className="rounded-[22px] border border-[#ece6f3] bg-[#faf8fc] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#c9bbdc] text-[#8f71b8]">
                <Car className="h-5 w-5" />
              </div>
              <div className="text-[1.02rem] leading-7 text-[#5f5b69]">
                Find trusted support rides from peers and local helpers.
              </div>
            </div>
          </div>
          <button className="w-full rounded-[18px] bg-[#b8d97b] px-3 py-4 text-[1rem] font-medium text-white">
            Request support
          </button>
        </div>
      </div>
    </div>
  );
}

export function MobileApp() {
  const [tab, setTab] = useState<TabId>('home');

  return (
    <div className="app-shell">
      <div className="noise" />
      <div className="phone-frame">
        <AppHeader />

        <div className="scroll-area min-h-[calc(100vh-176px)] overflow-y-auto bg-[#efefef]">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              {tab === 'home' && <HomeTab />}
              {tab === 'visit' && <VisitTab />}
              {tab === 'meds' && <MedsTab />}
              {tab === 'rehab' && <RehabTab />}
              {tab === 'support' && <SupportTab />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="safe-bottom absolute inset-x-0 bottom-0 border-t border-[#e7e0ef] bg-white px-3 pb-3 pt-2">
          <div className="grid grid-cols-5 gap-1">
            {TABS.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`rounded-[18px] px-1 py-2.5 text-center transition ${
                    active ? 'bg-[#f1edf6] text-[#8f71b8]' : 'text-[#9c95a7]'
                  }`}
                >
                  <Icon className="mx-auto h-5 w-5" />
                  <div className="mt-1 text-[11px] font-medium">{item.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
