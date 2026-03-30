'use client';

import type { ChangeEvent, ReactNode } from 'react';
import { useMemo, useRef, useState } from 'react';
import { BellRing, CarFront, MessageCircleHeart, Mic, MicOff, Phone, Send, Settings2, Video } from 'lucide-react';
import {
  PrimaryButton,
  ScreenTitle,
  SegmentedTabs,
  SectionCard,
  SecondaryButton,
  StatusBadge,
  ToggleRow,
} from '@/components/app/ui';
import {
  formatLongDate,
  getCommunityMatches,
  getProviderRecommendations,
  getTransportRecommendations,
} from '@/lib/corvas-logic';
import { COMMUNITY_SUPPORT_MEMBERS, PROVIDER_MATCHES, TRANSPORT_OPTIONS } from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function canUseSpeechRecognition() {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function SupportScreen({
  installCard,
}: {
  installCard?: ReactNode;
}) {
  const {
    onboarding,
    contacts,
    supportMessages,
    escalations,
    updateOnboarding,
    addSupportMessage,
    reopenOnboarding,
    setActiveTab,
  } = useAppStore();

  const doctor = contacts.find((contact) => contact.name.includes('Dr.')) ?? contacts.find((contact) => contact.role === 'care-team');
  const [selectedContactId, setSelectedContactId] = useState(doctor?.id ?? contacts[0]?.id ?? '');
  const [message, setMessage] = useState('I need a little help understanding what to do next.');
  const [travelMiles, setTravelMiles] = useState(18);
  const [voiceDraft, setVoiceDraft] = useState('');
  const [isRecordingVoiceNote, setIsRecordingVoiceNote] = useState(false);
  const [supportPanel, setSupportPanel] = useState<'thread' | 'alerts'>('thread');
  const [networkPanel, setNetworkPanel] = useState<'transport' | 'providers' | 'community' | 'settings'>('transport');
  const [supportNotice, setSupportNotice] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const topEscalation = escalations[0];

  const selectedContact = contacts.find((contact) => contact.id === selectedContactId) ?? doctor ?? contacts[0];
  const thread = useMemo(
    () =>
      supportMessages.map((item) => ({
        ...item,
        contactName: item.contactId ? contacts.find((contact) => contact.id === item.contactId)?.name : null,
      })),
    [contacts, supportMessages]
  );
  const transportOptions = useMemo(() => getTransportRecommendations(TRANSPORT_OPTIONS, travelMiles), [travelMiles]);
  const providerOptions = useMemo(() => getProviderRecommendations(PROVIDER_MATCHES, travelMiles), [travelMiles]);
  const communityMatches = useMemo(() => getCommunityMatches(COMMUNITY_SUPPORT_MEMBERS, travelMiles), [travelMiles]);

  function startVoiceNote() {
    if (!canUseSpeechRecognition()) {
      setVoiceDraft('Voice notes are not available on this device right now. You can still send a text update.');
      return;
    }

    const Recognition = ((window as Window & {
      webkitSpeechRecognition?: SpeechRecognitionCtor;
      SpeechRecognition?: SpeechRecognitionCtor;
    }).webkitSpeechRecognition
      || (window as Window & { SpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition) as SpeechRecognitionCtor;

    if (!recognitionRef.current) {
      const recognition = new Recognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        const text = Array.from(event.results)
          .map((result) => result[0]?.transcript ?? '')
          .join(' ')
          .trim();
        setVoiceDraft(text);
      };
      recognition.onerror = () => setIsRecordingVoiceNote(false);
      recognition.onend = () => setIsRecordingVoiceNote(false);
      recognitionRef.current = recognition;
    }

    if (isRecordingVoiceNote) {
      recognitionRef.current.stop();
      setIsRecordingVoiceNote(false);
      return;
    }

    setVoiceDraft('');
    setIsRecordingVoiceNote(true);
    recognitionRef.current.start();
  }

  function sendVoiceNote() {
    const transcript = voiceDraft.trim();
    if (!transcript) return;
    addSupportMessage(`Voice note: ${transcript}`, selectedContactId, topEscalation?.tier === 'urgent');
    setVoiceDraft('');
    setSupportNotice('Voice note added to your care-team thread.');
  }

  function sendTextUpdate() {
    const trimmed = message.trim();
    if (!trimmed) return;
    addSupportMessage(trimmed, selectedContactId, topEscalation?.tier === 'urgent');
    setSupportNotice(`Your update is ready for ${selectedContact?.name ?? 'the care team'}.`);
    setMessage('I need a little help understanding what to do next.');
  }

  function handleMilesChange(event: ChangeEvent<HTMLInputElement>) {
    setTravelMiles(Number(event.target.value));
  }

  function openAlertSupport(eventTitle: string) {
    const alertMessage = `I need help with this alert: ${eventTitle}.`;
    setMessage(alertMessage);
    addSupportMessage(alertMessage, selectedContactId, topEscalation?.tier === 'urgent');
    setSupportPanel('thread');
    setSupportNotice(`This alert was added to your support thread for ${selectedContact?.name ?? 'the care team'}.`);
  }

  return (
    <div className="space-y-6">
      <ScreenTitle
        eyebrow="Messages and support"
        title="Doctor contact, voice notes, and logistics belong here."
        description="This screen now handles the actual support network around recovery: texting, voice notes, call or video options, and getting people to appointments."
        action={<StatusBadge tier={topEscalation?.tier ?? 'steady'} />}
      />

      <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
        <div className="space-y-6">
          <SectionCard tone={topEscalation ? 'soft' : 'default'}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-teal-deep)]">Contact the care team</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Text, call, or video chat</h2>
                <p className="mt-2 text-base leading-7 text-slate-700">
                  AI can help draft the message, but the point is getting the patient to a real person fast.
                </p>
              </div>
              <MessageCircleHeart className="h-6 w-6 text-[var(--color-teal-deep)]" />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {contacts.filter((contact) => contact.role === 'care-team' || contact.role === 'family').map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => setSelectedContactId(contact.id)}
                  className={`rounded-[20px] border px-4 py-4 text-left ${
                    selectedContactId === contact.id
                      ? 'border-[var(--color-teal-deep)] bg-[var(--color-panel-highlight)]'
                      : 'border-[var(--color-panel-border)] bg-white'
                  }`}
                >
                  <p className="text-base font-semibold text-slate-900">{contact.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{contact.relationship}</p>
                  <p className="mt-2 text-sm text-slate-600">{contact.availability}</p>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-[24px] bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Message help</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(selectedContact.aiPromptHelp ?? [
                  'I am more short of breath this week. Can we review what I should do?',
                  'Travel is becoming hard. Is there a closer option or video follow-up?',
                  'I missed rehab and want help getting back on track.',
                ]).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setMessage(prompt)}
                    className="min-h-11 rounded-full border border-[var(--color-panel-border)] px-4 text-sm font-medium text-slate-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="mt-4 min-h-28 w-full rounded-[22px] border border-[var(--color-panel-border)] px-4 py-4 text-lg text-slate-900 outline-none placeholder:text-slate-400 focus:border-[var(--color-teal-deep)]"
                placeholder="Write a short update."
              />

              <div className="mt-4 rounded-[24px] bg-[var(--color-panel-soft)] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Voice note</p>
                    <p className="mt-2 text-base leading-7 text-slate-700">
                      Use a voice note when typing feels like too much. CorVas turns it into a message for the care team.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startVoiceNote}
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${
                      isRecordingVoiceNote ? 'bg-[var(--color-coral)] text-white' : 'bg-[var(--color-teal-deep)] text-white'
                    }`}
                    aria-label={isRecordingVoiceNote ? 'Stop voice note recording' : 'Start voice note recording'}
                  >
                    {isRecordingVoiceNote ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </button>
                </div>

                <div className="mt-4 rounded-[20px] bg-white px-4 py-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Draft</p>
                  <p className="mt-2 text-base leading-7 text-slate-800">
                    {voiceDraft || 'Tap the microphone to record a quick update.'}
                  </p>
                </div>
              </div>

              {supportNotice ? (
                <div className="mt-4 rounded-[18px] bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                  {supportNotice}
                </div>
              ) : null}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <PrimaryButton onClick={sendTextUpdate}>
                  <span className="inline-flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Send text update
                  </span>
                </PrimaryButton>
                <a
                  href={`tel:${selectedContact.phone.replace(/[^\d+]/g, '')}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--color-panel-border)] bg-white px-5 py-3 text-base font-semibold text-slate-900"
                >
                  <Phone className="h-5 w-5" />
                  Call
                </a>
                <SecondaryButton onClick={sendVoiceNote} disabled={!voiceDraft.trim()}>
                  Send voice note
                </SecondaryButton>
                {selectedContact.videoLink ? (
                  <a
                    href={selectedContact.videoLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--color-panel-border)] bg-white px-5 py-3 text-base font-semibold text-slate-900"
                  >
                    <Video className="h-5 w-5" />
                    Video chat
                  </a>
                ) : null}
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-teal-deep)]">Updates</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Thread and alerts</h2>
              </div>
              {supportPanel === 'thread' ? (
                <MessageCircleHeart className="h-6 w-6 text-[var(--color-teal-deep)]" />
              ) : (
                <BellRing className="h-6 w-6 text-[var(--color-teal-deep)]" />
              )}
            </div>

            <SegmentedTabs
              value={supportPanel}
              onChange={setSupportPanel}
              options={[
                { value: 'thread', label: 'Recent updates' },
                { value: 'alerts', label: 'Escalation notices' },
              ]}
              className="mt-5 sm:grid-cols-2"
            />

            {supportPanel === 'thread' ? (
              <div className="mt-5 space-y-3">
                {thread.slice(-6).map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-[22px] px-4 py-4 ${
                      item.sender === 'patient'
                        ? 'bg-[var(--color-panel-highlight)]'
                        : item.sender === 'corvas'
                          ? 'border border-[var(--color-panel-border)] bg-[var(--color-panel-soft)]'
                          : 'bg-white'
                    }`}
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {item.sender === 'patient' ? 'You' : item.sender === 'corvas' ? 'CorVas' : item.contactName ?? 'Support'}
                    </p>
                    <p className="mt-2 text-base leading-7 text-slate-800">{item.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {escalations.length ? (
                  escalations.map((event) => (
                    <div key={event.id} className="rounded-[22px] border border-[var(--color-panel-border)] bg-white px-4 py-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{formatLongDate(event.createdAt)}</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">{event.title}</h3>
                      <p className="mt-2 text-base leading-7 text-slate-700">{event.message}</p>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <PrimaryButton onClick={() => openAlertSupport(event.title)}>
                          Message care team
                        </PrimaryButton>
                        <SecondaryButton
                          onClick={() => {
                            setActiveTab('ask');
                          }}
                        >
                          Ask CorVas what this means
                        </SecondaryButton>
                        {event.tier === 'urgent' ? (
                          <a
                            href="tel:911"
                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--color-panel-border)] bg-white px-5 py-3 text-base font-semibold text-slate-900"
                          >
                            Call 911 now
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[22px] bg-[var(--color-panel-soft)] px-4 py-4 text-base leading-7 text-slate-700">
                    No active escalation notices right now.
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard tone="highlight">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-teal-deep)]">Practical support</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Travel, matching, and settings</h2>
                <p className="mt-2 text-base leading-7 text-slate-700">
                  Practical barriers belong here too, not just symptoms and messages.
                </p>
              </div>
              {networkPanel === 'transport' ? (
                <CarFront className="h-6 w-6 text-[var(--color-teal-deep)]" />
              ) : networkPanel === 'providers' ? (
                <Phone className="h-6 w-6 text-[var(--color-teal-deep)]" />
              ) : networkPanel === 'community' ? (
                <MessageCircleHeart className="h-6 w-6 text-[var(--color-teal-deep)]" />
              ) : (
                <Settings2 className="h-6 w-6 text-[var(--color-teal-deep)]" />
              )}
            </div>

            <SegmentedTabs
              value={networkPanel}
              onChange={setNetworkPanel}
              options={[
                { value: 'transport', label: 'Transport' },
                { value: 'providers', label: 'Providers' },
                { value: 'community', label: 'Community' },
                { value: 'settings', label: 'Settings' },
              ]}
              className="mt-5 sm:grid-cols-2 xl:grid-cols-4"
            />

            {networkPanel === 'transport' ? (
              <>
                <div className="mt-5 rounded-[24px] bg-white/88 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-semibold text-slate-900">How far is the trip?</p>
                    <p className="text-base font-semibold text-slate-900">{travelMiles} miles</p>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={40}
                    step={1}
                    value={travelMiles}
                    onChange={handleMilesChange}
                    className="mt-4 w-full accent-[var(--color-teal-deep)]"
                  />
                </div>

                <div className="mt-5 space-y-3">
                  {transportOptions.map((option) => (
                    <div key={option.id} className="rounded-[22px] border border-[var(--color-panel-border)] bg-white px-4 py-4">
                      <p className="text-base font-semibold text-slate-900">{option.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{option.bookingLead}</p>
                      <p className="mt-2 text-base leading-7 text-slate-700">{option.details}</p>
                      <div className="mt-3">
                        <SecondaryButton
                          onClick={() => {
                            addSupportMessage(`I would like help setting up ${option.name.toLowerCase()} for my appointments.`, selectedContactId, false);
                            setSupportNotice(`${option.name} was added to your support thread.`);
                          }}
                        >
                          Ask for this option
                        </SecondaryButton>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : networkPanel === 'providers' ? (
              <div className="mt-5 space-y-3">
                {providerOptions.map((provider) => (
                  <div key={provider.id} className="rounded-[22px] border border-[var(--color-panel-border)] bg-white px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-slate-900">{provider.name}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {provider.specialty} · {provider.distanceMiles} miles · about {provider.etaMinutes} minutes
                        </p>
                      </div>
                      {provider.offersVideo ? (
                        <span className="rounded-full bg-[var(--color-panel-soft)] px-3 py-1 text-sm font-semibold text-[var(--color-teal-deep)]">
                          Video available
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-base leading-7 text-slate-700">{provider.whyItFits}</p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                      <SecondaryButton
                        onClick={() => {
                          addSupportMessage(`Please help me follow up with ${provider.name}.`, selectedContactId, false);
                          setSupportNotice(`${provider.name} was added to your support thread.`);
                        }}
                      >
                        Request follow-up
                      </SecondaryButton>
                      {provider.videoLink ? (
                        <a
                          href={provider.videoLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--color-panel-border)] bg-white px-5 py-3 text-base font-semibold text-slate-900"
                        >
                          <Video className="h-5 w-5" />
                          Open video option
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : networkPanel === 'community' ? (
              <div className="mt-5 space-y-3">
                {communityMatches.map((member) => (
                  <div key={member.id} className="rounded-[22px] border border-[var(--color-panel-border)] bg-white px-4 py-4">
                    <p className="text-base font-semibold text-slate-900">{member.name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {member.role.replace('-', ' ')} · {member.area} · {member.distanceMiles} miles away
                    </p>
                    <p className="mt-2 text-base leading-7 text-slate-700">{member.note}</p>
                    <p className="mt-2 text-sm text-slate-600">{member.availability}</p>
                    <div className="mt-3">
                      <SecondaryButton
                        onClick={() => {
                          addSupportMessage(`Please connect me with ${member.name} for support around visits or recovery.`, selectedContactId, false);
                          setSupportNotice(`${member.name} was added to your support thread.`);
                        }}
                      >
                        Ask for this support
                      </SecondaryButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                <SecondaryButton onClick={reopenOnboarding}>
                  Review onboarding
                </SecondaryButton>
                <ToggleRow
                  label="Large text"
                  description="Recommended for easier reading."
                  checked={onboarding.largeText}
                  onChange={(value) => updateOnboarding({ largeText: value })}
                />
                <ToggleRow
                  label="Spoken replies"
                  description="Read important answers out loud."
                  checked={onboarding.spokenReplies}
                  onChange={(value) => updateOnboarding({ spokenReplies: value })}
                />
                <ToggleRow
                  label="Caregiver updates"
                  description="Suggest family updates when recovery gets off track."
                  checked={onboarding.caregiverUpdates}
                  onChange={(value) => updateOnboarding({ caregiverUpdates: value })}
                />
              </div>
            )}
          </SectionCard>

          {installCard}
        </div>
      </div>
    </div>
  );
}
