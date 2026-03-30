'use client';

import { useMemo, useState } from 'react';
import { Bell, CalendarClock, Pill, ShieldAlert } from 'lucide-react';
import {
  PrimaryButton,
  ProgressBar,
  ScreenTitle,
  SegmentedTabs,
  SectionCard,
  SecondaryButton,
  StatusBadge,
} from '@/components/app/ui';
import { formatLongDate, formatTime, getMedicationSummary } from '@/lib/corvas-logic';
import { useAppStore } from '@/lib/store';
import { downloadCalendarEvent } from '@/lib/utils';
import { verifyMedicationLog } from '@/lib/verification';

export function MedicationsScreen() {
  const { medications, escalations, markDoseStatus, setActiveTab, addSupportMessage } = useAppStore();
  const [verificationMessage, setVerificationMessage] = useState<{id: string; message: string; type: 'error' | 'success'} | null>(null);
  const [verifyingDoseId, setVerifyingDoseId] = useState<string | null>(null);
  const [selectedMedicationId, setSelectedMedicationId] = useState(medications[0]?.id ?? '');
  const [helpPanel, setHelpPanel] = useState<'support' | 'reminders' | 'safety'>('support');
  const summary = useMemo(() => getMedicationSummary(medications), [medications]);
  const topEscalation = escalations[0];
  const selectedMedication = medications.find((medication) => medication.id === selectedMedicationId) ?? medications[0];

  const handleMarkTaken = async (doseId: string, scheduledAt: string) => {
    setVerifyingDoseId(doseId);
    try {
      const result = await verifyMedicationLog(scheduledAt);

      if (result.verified) {
        markDoseStatus(doseId, 'taken');
        setVerificationMessage({
          id: doseId,
          message: '✓ Medication logged and verified',
          type: 'success',
        });
        setTimeout(() => setVerificationMessage(null), 3000);
      } else {
        setVerificationMessage({
          id: doseId,
          message: result.message,
          type: 'error',
        });
      }
    } finally {
      setVerifyingDoseId(null);
    }
  };

  const handleQuickStatus = (doseId: string, status: 'snoozed' | 'skipped') => {
    markDoseStatus(doseId, status);
    setVerificationMessage({
      id: doseId,
      message: status === 'snoozed' ? 'Dose moved for a later reminder.' : 'Dose marked as skipped. CorVas will keep an eye on it.',
      type: status === 'snoozed' ? 'success' : 'error',
    });
    setTimeout(() => setVerificationMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <ScreenTitle
        eyebrow="Medication support"
        title="Large reminders, gentle follow-up, and clear dose logging."
        description="Nothing fancy here. Just an easy way to stay on track and ask for support if doses start slipping."
        action={<StatusBadge tier={topEscalation?.tier ?? 'steady'} />}
      />

      <SectionCard tone="highlight">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-teal-deep)]">
              Today’s medication picture
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">
              {summary.taken} logged, {summary.due} still to confirm
            </h2>
            <p className="mt-3 text-lg leading-8 text-slate-700">
              Adherence so far: {summary.adherence}%. If a dose is missed, CorVas shifts into a calm follow-up instead of blame.
            </p>
          </div>
          <div className="rounded-[24px] bg-white/85 px-5 py-4 text-center">
            <div className="text-sm text-slate-600">Trend</div>
            <div className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{summary.adherence}%</div>
          </div>
        </div>
        <ProgressBar value={summary.adherence} className="mt-5" />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <SectionCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-teal-deep)]">
                  Medication list
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Choose one medication</h2>
                <p className="mt-2 text-base leading-7 text-slate-700">
                  Keep the list simple, then focus on one medicine at a time.
                </p>
              </div>
              <Pill className="h-6 w-6 text-[var(--color-teal-deep)]" />
            </div>

            <div className="mt-5 grid gap-3">
              {medications.map((medication) => (
                <button
                  key={medication.id}
                  type="button"
                  onClick={() => setSelectedMedicationId(medication.id)}
                  className={`rounded-[22px] border px-4 py-4 text-left ${
                    selectedMedication?.id === medication.id
                      ? 'border-[var(--color-teal-deep)] bg-[var(--color-panel-highlight)]'
                      : 'border-[var(--color-panel-border)] bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{medication.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{medication.dose} · {medication.schedule.join(', ')}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700">
                      {medication.doses.filter((dose) => dose.status === 'taken').length}/{medication.doses.length}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {selectedMedication ? (
              <div className="mt-5 rounded-[24px] border border-[var(--color-panel-border)] bg-white p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-teal-deep)]">
                  {selectedMedication.name}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">{selectedMedication.dose}</h3>
                <p className="mt-3 text-base leading-7 text-slate-700">{selectedMedication.purpose}</p>
                <p className="mt-2 text-base leading-7 text-slate-700">{selectedMedication.instructions}</p>

                <div className="mt-5 space-y-3">
                  {selectedMedication.doses
                    .slice()
                    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))
                    .map((dose) => (
                      <div key={dose.id}>
                        <div className="rounded-[22px] border border-[var(--color-panel-border)] bg-[var(--color-panel-soft)] px-4 py-4">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="text-base font-semibold text-slate-900">{formatLongDate(dose.scheduledAt)}</p>
                              <p className="mt-1 text-base text-slate-600">{formatTime(dose.scheduledAt)}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={verifyingDoseId === dose.id}
                                onClick={() => handleMarkTaken(dose.id, dose.scheduledAt)}
                                className={`min-h-11 rounded-full px-4 text-sm font-semibold ${
                                  dose.status === 'taken'
                                    ? 'bg-emerald-600 text-white'
                                    : 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                                } ${verifyingDoseId === dose.id ? 'opacity-60' : ''}`}
                              >
                                {verifyingDoseId === dose.id ? 'Verifying...' : 'Taken'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickStatus(dose.id, 'snoozed')}
                                className={`min-h-11 rounded-full px-4 text-sm font-semibold ${
                                  dose.status === 'snoozed'
                                    ? 'bg-[var(--color-teal-deep)] text-white'
                                    : 'border border-[var(--color-panel-border)] bg-white text-slate-800'
                                }`}
                              >
                                Snooze
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickStatus(dose.id, 'skipped')}
                                className={`min-h-11 rounded-full px-4 text-sm font-semibold ${
                                  dose.status === 'skipped'
                                    ? 'bg-[var(--color-coral)] text-white'
                                    : 'border border-rose-200 bg-rose-50 text-rose-800'
                                }`}
                              >
                                Skipped
                              </button>
                            </div>
                          </div>
                        </div>
                        {verificationMessage?.id === dose.id ? (
                          <div
                            className={`mt-2 rounded-[16px] px-4 py-3 text-sm font-semibold ${
                              verificationMessage.type === 'success'
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-rose-50 text-rose-800'
                            }`}
                          >
                            {verificationMessage.message}
                          </div>
                        ) : null}
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard tone={topEscalation ? 'soft' : 'default'}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-teal-deep)]">
                  Medication help
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Support, reminders, and safety</h2>
                <p className="mt-2 text-base leading-7 text-slate-700">
                  The extras are still here, just grouped so the page feels calmer.
                </p>
              </div>
              {helpPanel === 'support' ? (
                <Bell className="h-6 w-6 text-[var(--color-teal-deep)]" />
              ) : helpPanel === 'reminders' ? (
                <CalendarClock className="h-6 w-6 text-[var(--color-teal-deep)]" />
              ) : (
                <ShieldAlert className="h-6 w-6 text-[var(--color-coral)]" />
              )}
            </div>

            <SegmentedTabs
              value={helpPanel}
              onChange={setHelpPanel}
              options={[
                { value: 'support', label: 'Gentle follow-up' },
                { value: 'reminders', label: 'Calendar reminders' },
                { value: 'safety', label: 'Refill and safety' },
              ]}
              className="mt-5 sm:grid-cols-3"
            />

            {helpPanel === 'support' ? (
              <>
                <div className="mt-5 rounded-[22px] bg-[var(--color-panel-soft)] p-4 text-base leading-7 text-slate-800">
                  {summary.skipped
                    ? `There ${summary.skipped === 1 ? 'is' : 'are'} ${summary.skipped} skipped dose${summary.skipped === 1 ? '' : 's'} on record. A calm follow-up is active.`
                    : 'No skipped doses are active right now.'}
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  <PrimaryButton
                    onClick={() => {
                      addSupportMessage('I need help staying on track with my medicines.', undefined, topEscalation?.tier === 'urgent');
                      setActiveTab('support');
                    }}
                  >
                    Share update with support
                  </PrimaryButton>
                  <SecondaryButton onClick={() => setActiveTab('ask')}>
                    Ask what to do about a missed dose
                  </SecondaryButton>
                </div>
              </>
            ) : helpPanel === 'reminders' ? (
              <div className="mt-5 space-y-3">
                {medications.map((medication) => (
                  <button
                    key={medication.id}
                    type="button"
                    onClick={() =>
                      downloadCalendarEvent({
                        title: `${medication.name} reminder`,
                        description: medication.instructions,
                        start: medication.doses[1]?.scheduledAt ?? medication.doses[0].scheduledAt,
                        end: new Date(new Date(medication.doses[1]?.scheduledAt ?? medication.doses[0].scheduledAt).getTime() + 10 * 60 * 1000).toISOString(),
                      })
                    }
                    className="flex min-h-12 w-full items-center justify-between rounded-[20px] border border-[var(--color-panel-border)] bg-white px-4 py-3 text-left text-base font-semibold text-slate-800"
                  >
                    <span>{medication.name}</span>
                    <span className="text-sm text-slate-500">{medication.schedule.join(', ')}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {medications.map((medication) => (
                  <div key={medication.id} className="rounded-[20px] border border-[var(--color-panel-border)] bg-white px-4 py-4">
                    <p className="text-base font-semibold text-slate-900">{medication.name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Refill reminder target: {medication.refillDate ? formatLongDate(medication.refillDate) : 'Not set'}
                    </p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                      <SecondaryButton
                        onClick={() => {
                          addSupportMessage(`I need help with my ${medication.name} refill.`, undefined, false);
                          setActiveTab('support');
                        }}
                      >
                        Request refill help
                      </SecondaryButton>
                      <SecondaryButton onClick={() => setActiveTab('ask')}>
                        Ask about side effects
                      </SecondaryButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
