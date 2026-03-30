'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, CalendarCheck2, CircleAlert, Footprints, Heart, Plus, Trash2, Trophy } from 'lucide-react';
import {
  PrimaryButton,
  ProgressBar,
  ScreenTitle,
  SegmentedTabs,
  SectionCard,
  SecondaryButton,
  StatusBadge,
} from '@/components/app/ui';
import { getRecoverySummary } from '@/lib/corvas-logic';
import { useAppStore } from '@/lib/store';
import { calculateHRZone, calculateMaxHR, checkSafeHRThreshold } from '@/lib/utils';
import { verifyWorkoutLog } from '@/lib/verification';

const SETBACK_OPTIONS = [
  { value: 'fatigue', label: 'I felt too tired' },
  { value: 'transport', label: 'Getting there was hard' },
  { value: 'worry', label: 'I felt worried' },
  { value: 'symptoms', label: 'Symptoms got in the way' },
  { value: 'schedule', label: 'The day got away from me' },
] as const;

export function RecoveryScreen() {
  const { patient, recoveryWeeks, setbacks, wearableSessions, completeRecoverySession, logRecoverySetback, addWearableSession, removeWearableSession } = useAppStore();
  const [selectedReason, setSelectedReason] = useState<(typeof SETBACK_OPTIONS)[number]['value']>('fatigue');
  const [setbackNote, setSetbackNote] = useState('');
  const [recoveryPanel, setRecoveryPanel] = useState<'sessions' | 'setbacks'>('sessions');
  const [progressPanel, setProgressPanel] = useState<'program' | 'activity'>('program');
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(recoveryWeeks.find((week) => week.status === 'current')?.week ?? recoveryWeeks[0]?.week ?? 1);
  const [wearableFormOpen, setWearableFormOpen] = useState(false);
  const [workoutVerifyMessage, setWorkoutVerifyMessage] = useState<{message: string; type: 'error' | 'success'} | null>(null);
  const [verifyingWorkout, setVerifyingWorkout] = useState(false);
  const [wearableForm, setWearableForm] = useState<{
    activityType: 'walk' | 'swim' | 'bike' | 'stretch' | 'rest';
    durationMinutes: number;
    avgHeartRate: number;
  }>({
    activityType: 'walk',
    durationMinutes: 20,
    avgHeartRate: 75,
  });
  const summary = useMemo(() => getRecoverySummary(recoveryWeeks), [recoveryWeeks]);
  const maxHR = calculateMaxHR(patient.age);
  const selectedWeek = recoveryWeeks.find((week) => week.week === selectedWeekNumber) ?? summary.currentWeek;

  const handleLogWearable = async () => {
    setVerifyingWorkout(true);
    try {
      const result = await verifyWorkoutLog(
        wearableForm.activityType,
        wearableForm.durationMinutes,
        wearableForm.avgHeartRate
      );

      if (result.verified) {
        const hrZone = calculateHRZone(wearableForm.avgHeartRate, maxHR);
        const exceededThreshold = checkSafeHRThreshold(wearableForm.avgHeartRate);
        addWearableSession({
          source: 'manual',
          activityType: wearableForm.activityType,
          durationMinutes: wearableForm.durationMinutes,
          avgHeartRate: wearableForm.avgHeartRate,
          hrZone,
          exceededSafeThreshold: exceededThreshold,
          isVerified: true,
          verifications: result.verifications,
        });
        setWorkoutVerifyMessage({
          message: '✓ Workout logged and verified',
          type: 'success',
        });
        setTimeout(() => {
          setWearableFormOpen(false);
          setWorkoutVerifyMessage(null);
          setWearableForm({ activityType: 'walk', durationMinutes: 20, avgHeartRate: 75 });
        }, 1500);
      } else {
        setWorkoutVerifyMessage({
          message: result.message,
          type: 'error',
        });
      }
    } finally {
      setVerifyingWorkout(false);
    }
  };

  const thisWeekSessions = wearableSessions.filter((session) => {
    const sessionDate = new Date(session.createdAt);
    const today = new Date();
    const daysAgo = (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo < 7;
  });

  return (
    <div className="space-y-6">
      <ScreenTitle
        eyebrow="Recovery plan"
        title={`Week ${summary.currentWeek.week} of 12`}
        description="A simpler week-by-week view of cardiac rehab, with clear wins and a gentle place to log setbacks."
        action={<StatusBadge tier={summary.missed >= 2 ? 'support' : summary.missed === 1 ? 'watch' : 'steady'} />}
      />

      <SectionCard tone="highlight">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-teal-deep)]">
              This week’s focus
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">{summary.currentWeek.focus}</h2>
            <p className="mt-3 text-lg leading-8 text-slate-700">
              Milestone: {summary.currentWeek.milestone}
            </p>
          </div>
          <div className="rounded-[24px] bg-white/80 px-5 py-4">
            <div className="text-sm text-slate-600">Progress this week</div>
            <div className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{summary.progress}%</div>
          </div>
        </div>
        <ProgressBar value={summary.progress} className="mt-5" />
        <p className="mt-3 text-base text-slate-700">
          {summary.completed} of {summary.total} sessions complete. {summary.missed ? `${summary.missed} session needs a gentle reset.` : 'You are on track this week.'}
        </p>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-teal-deep)]">
                Today and this week
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Recovery actions</h2>
            </div>
            <Footprints className="h-6 w-6 text-[var(--color-teal-deep)]" />
          </div>

          <SegmentedTabs
            value={recoveryPanel}
            onChange={setRecoveryPanel}
            options={[
              { value: 'sessions', label: 'Sessions' },
              { value: 'setbacks', label: 'Setbacks' },
            ]}
            className="mt-5 sm:grid-cols-2"
          />

          {recoveryPanel === 'sessions' ? (
            <div className="mt-5 space-y-3">
              {summary.currentWeek.sessions.map((session) => (
                <div
                  key={session.id}
                  className={`rounded-[22px] border px-4 py-4 ${
                    session.status === 'completed'
                      ? 'border-emerald-200 bg-emerald-50'
                      : session.status === 'today'
                        ? 'border-[var(--color-teal-deep)] bg-[var(--color-panel-highlight)]'
                        : session.status === 'missed'
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-[var(--color-panel-border)] bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{session.dayLabel}</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950">{session.title}</h3>
                      <p className="mt-2 text-base leading-7 text-slate-700">{session.description}</p>
                      <p className="mt-2 text-sm text-slate-600">
                        {session.durationMinutes} minutes. Goal: {session.target}.
                      </p>
                    </div>
                    {session.status === 'today' ? (
                      <PrimaryButton onClick={() => completeRecoverySession(session.id)}>
                        Mark complete
                      </PrimaryButton>
                    ) : (
                      <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                        {session.status === 'completed' && 'Done'}
                        {session.status === 'missed' && 'Missed'}
                        {session.status === 'upcoming' && 'Coming up'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className="mt-5 text-base leading-7 text-slate-700">
                Missing or shortening a session does not erase your progress. Logging it helps CorVas support you better.
              </p>
              <div className="mt-5 grid gap-3">
                {SETBACK_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedReason(option.value)}
                    className={`rounded-[20px] border px-4 py-4 text-left text-base ${
                      selectedReason === option.value
                        ? 'border-[var(--color-teal-deep)] bg-[var(--color-panel-highlight)] text-slate-900'
                        : 'border-[var(--color-panel-border)] bg-white text-slate-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <textarea
                value={setbackNote}
                onChange={(event) => setSetbackNote(event.target.value)}
                className="mt-4 min-h-28 w-full rounded-[20px] border border-[var(--color-panel-border)] px-4 py-4 text-lg text-slate-900 outline-none placeholder:text-slate-400 focus:border-[var(--color-teal-deep)]"
                placeholder="What happened today?"
              />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <PrimaryButton
                  onClick={() => {
                    logRecoverySetback(selectedReason, setbackNote || 'Needed to ease back today.');
                    setSetbackNote('');
                  }}
                >
                  Save setback
                </PrimaryButton>
                <SecondaryButton onClick={() => setSetbackNote('')}>
                  Clear
                </SecondaryButton>
              </div>

              <div className="mt-5 space-y-3">
                {setbacks.slice(0, 3).map((setback) => (
                  <div key={setback.id} className="rounded-[20px] border border-[var(--color-panel-border)] bg-white px-4 py-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {new Date(setback.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="mt-2 text-base leading-7 text-slate-800">{setback.note}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </SectionCard>
      </div>

      <SectionCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-teal-deep)]">
              Progress and activity
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Program view and logged activity</h2>
          </div>
          {progressPanel === 'program' ? (
            <CalendarCheck2 className="h-6 w-6 text-[var(--color-teal-deep)]" />
          ) : (
            <Heart className="h-6 w-6 text-[var(--color-teal-deep)]" />
          )}
        </div>

        <SegmentedTabs
          value={progressPanel}
          onChange={setProgressPanel}
          options={[
            { value: 'program', label: '12-week plan' },
            { value: 'activity', label: 'Exercise log' },
          ]}
          className="mt-5 sm:grid-cols-2"
        />

        {progressPanel === 'program' ? (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {recoveryWeeks.map((week) => (
                <button
                  key={week.week}
                  type="button"
                  onClick={() => setSelectedWeekNumber(week.week)}
                  className={`rounded-[22px] border px-4 py-4 text-left ${
                    selectedWeek.week === week.week
                      ? 'border-[var(--color-teal-deep)] bg-[var(--color-panel-highlight)]'
                      : week.status === 'completed'
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-[var(--color-panel-border)] bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Week {week.week}</p>
                      <p className="mt-2 text-base font-semibold text-slate-950">{week.focus}</p>
                    </div>
                    {week.status === 'completed' ? <Trophy className="h-5 w-5 text-emerald-700" /> : null}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-[24px] border border-[var(--color-panel-border)] bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-teal-deep)]">Week {selectedWeek.week}</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">{selectedWeek.focus}</h3>
              <p className="mt-3 text-base leading-7 text-slate-700">{selectedWeek.milestone}</p>
              <div className="mt-4 space-y-2">
                {selectedWeek.sessions.map((session) => (
                  <div key={session.id} className="rounded-[18px] bg-[var(--color-panel-soft)] px-4 py-3 text-sm text-slate-800">
                    <span className="font-semibold">{session.dayLabel}:</span> {session.title}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mt-5 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold">Live data requires the iOS app.</p>
                  <p className="mt-1">For now, you can manually log exercise sessions.</p>
                </div>
              </div>
            </div>

            {thisWeekSessions.length > 0 ? (
              <div className="mt-5 space-y-3">
                <p className="text-sm font-semibold text-slate-600">This week&apos;s activity</p>
                <div className="flex flex-wrap gap-2">
                  {thisWeekSessions.map((session) => {
                    const sessionDate = new Date(session.createdAt);
                    const today = new Date();
                    const daysAgo = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
                    const dayLabel = daysAgo === 0 ? 'Today' : `${daysAgo}d ago`;
                    const dayColor =
                      session.exceededSafeThreshold
                        ? 'bg-red-400'
                        : session.hrZone === 'zone1'
                          ? 'bg-blue-400'
                          : session.hrZone === 'zone2'
                            ? 'bg-emerald-400'
                            : session.hrZone === 'zone3'
                              ? 'bg-amber-400'
                              : 'bg-orange-400';

                    return (
                      <div
                        key={session.id}
                        className={`rounded-lg ${dayColor} px-3 py-2 text-center text-xs font-semibold text-white`}
                        title={`${session.activityType} - ${session.avgHeartRate} BPM`}
                      >
                        {dayLabel}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {wearableFormOpen ? (
              <div className="mt-5 space-y-4 rounded-[20px] border border-[var(--color-panel-border)] bg-[var(--color-panel-soft)] p-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Activity type</label>
                  <select
                    value={wearableForm.activityType}
                    onChange={(e) => setWearableForm({ ...wearableForm, activityType: e.target.value as 'walk' | 'swim' | 'bike' | 'stretch' | 'rest' })}
                    className="mt-2 w-full rounded-[14px] border border-[var(--color-panel-border)] bg-white px-3 py-2 text-base text-slate-900"
                  >
                    <option value="walk">Walk</option>
                    <option value="swim">Swim</option>
                    <option value="bike">Bike</option>
                    <option value="stretch">Stretch</option>
                    <option value="rest">Rest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900">Duration (minutes)</label>
                  <input
                    type="number"
                    value={wearableForm.durationMinutes}
                    onChange={(e) => setWearableForm({ ...wearableForm, durationMinutes: parseInt(e.target.value) })}
                    min="1"
                    max="180"
                    className="mt-2 w-full rounded-[14px] border border-[var(--color-panel-border)] px-3 py-2 text-base text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900">Average heart rate</label>
                  <input
                    type="number"
                    value={wearableForm.avgHeartRate}
                    onChange={(e) => setWearableForm({ ...wearableForm, avgHeartRate: parseInt(e.target.value) })}
                    min="40"
                    max="200"
                    className="mt-2 w-full rounded-[14px] border border-[var(--color-panel-border)] px-3 py-2 text-base text-slate-900"
                  />
                  <p className="mt-2 text-xs text-slate-600">
                    Zone {wearableForm.avgHeartRate > 120 ? '4 (red - above safe limit)' : calculateHRZone(wearableForm.avgHeartRate, maxHR).toUpperCase().replace('ZONE', '')}
                  </p>
                </div>

                {workoutVerifyMessage ? (
                  <div
                    className={`rounded-[14px] px-4 py-3 text-sm font-semibold ${
                      workoutVerifyMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-rose-50 text-rose-800'
                    }`}
                  >
                    {workoutVerifyMessage.message}
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleLogWearable}
                    disabled={verifyingWorkout}
                    className="flex-1 rounded-[14px] bg-[var(--color-teal-deep)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {verifyingWorkout ? 'Verifying...' : 'Log activity'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWearableFormOpen(false);
                      setWorkoutVerifyMessage(null);
                    }}
                    className="flex-1 rounded-[14px] border border-[var(--color-panel-border)] bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setWearableFormOpen(true)}
                  className="w-full rounded-[18px] border border-[var(--color-panel-border)] bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  <Plus className="mr-2 inline h-4 w-4" />
                  Log activity manually
                </button>

                {wearableSessions.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {wearableSessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="rounded-[16px] border border-[var(--color-panel-border)] bg-white px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold capitalize text-slate-900">{session.activityType}</p>
                            <p className="mt-1 text-xs text-slate-600">
                              {session.durationMinutes} min • {session.avgHeartRate} BPM avg
                            </p>
                            {session.exceededSafeThreshold ? (
                              <p className="mt-1 text-xs font-semibold text-red-700">Above safe limit (120 BPM)</p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeWearableSession(session.id)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}
      </SectionCard>
    </div>
  );
}
