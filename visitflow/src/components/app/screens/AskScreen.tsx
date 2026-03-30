'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { FileText, Mic, MicOff, Play, Sparkles, Square, Upload, WandSparkles } from 'lucide-react';
import {
  PrimaryButton,
  ScreenTitle,
  SegmentedTabs,
  SectionCard,
  SecondaryButton,
} from '@/components/app/ui';
import {
  formatLongDate,
  generateVoiceFollowups,
  makeAssistantMessage,
  makeUserMessage,
  routeCorvasQuestion,
  simplifyDocument,
} from '@/lib/corvas-logic';
import { useAppStore } from '@/lib/store';
import type { VoiceState } from '@/lib/types';

const SUGGESTIONS = [
  'What did my doctor mean?',
  'Did I take my medicine today?',
  'I feel more short of breath today.',
  'What should I do tomorrow?',
];

const SIMULATED_VOICE_INPUTS = [
  'What did my doctor mean when they said arrhythmia?',
  'I feel more short of breath today and I am worried.',
  'Did I take my medicine today or do I still have a dose due?',
  'Travel to rehab is hard for me this week. What are my options?',
  'Can you help me ask my doctor if I should be seen sooner?',
];

const SIMULATED_LIVE_VISIT: Array<{
  id: string;
  speaker: 'doctor' | 'patient';
  text: string;
  linkedSegmentId?: string;
}> = [
  {
    id: 'sim-visit-1',
    speaker: 'doctor',
    text: 'Your EKG still shows a mild arrhythmia, so I want us to keep watching your rhythm during recovery.',
    linkedSegmentId: 'visit-1',
  },
  {
    id: 'sim-visit-2',
    speaker: 'patient',
    text: 'Is that something dangerous, or just something we need to follow?',
  },
  {
    id: 'sim-visit-3',
    speaker: 'doctor',
    text: 'It is not an emergency right now, but I do want you to start metoprolol every morning with food.',
    linkedSegmentId: 'visit-2',
  },
  {
    id: 'sim-visit-4',
    speaker: 'patient',
    text: 'What should I do if I feel more short of breath when I walk?',
  },
  {
    id: 'sim-visit-5',
    speaker: 'doctor',
    text: 'Keep exercise light enough that you can still talk, and stop if you get chest tightness or symptoms that do not settle with rest.',
    linkedSegmentId: 'visit-3',
  },
];

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export function AskScreen() {
  const {
    onboarding,
    medications,
    recoveryWeeks,
    symptomCheckIns,
    visitSegments,
    documents,
    chatHistory,
    activeDocumentId,
    selectedVisitSegmentId,
    patient,
    addChatMessage,
    addUploadedDocument,
    setActiveDocumentId,
    setSelectedVisitSegmentId,
    setActiveTab,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceFollowups, setVoiceFollowups] = useState<string[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [uploadTitle, setUploadTitle] = useState('My note');
  const [simulatedVoiceIndex, setSimulatedVoiceIndex] = useState(0);
  const [liveVisitActive, setLiveVisitActive] = useState(false);
  const [carePanel, setCarePanel] = useState<'ask' | 'live' | 'visit' | 'documents'>('ask');
  const [liveVisitTranscript, setLiveVisitTranscript] = useState<Array<(typeof SIMULATED_LIVE_VISIT)[number]>>([]);
  const timeoutIdsRef = useRef<number[]>([]);
  const selectedVisit = visitSegments.find((segment) => segment.id === selectedVisitSegmentId) ?? visitSegments[0];
  const selectedDocument = documents.find((document) => document.id === activeDocumentId) ?? documents[0];

  const recentQuestions = useMemo(
    () => chatHistory.filter((message) => message.role === 'user').slice(-4).reverse(),
    [chatHistory]
  );

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function handleAsk(question: string, mode: 'voice' | 'text') {
    const trimmed = question.trim();
    if (!trimmed) return;

    addChatMessage(makeUserMessage(trimmed, mode));
    setInput('');
    setVoiceTranscript(trimmed);
    setVoiceFollowups(generateVoiceFollowups(trimmed));
    setVoiceState('thinking');

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const answer = routeCorvasQuestion({
        text: trimmed,
        medications,
        weeks: recoveryWeeks,
        checkIns: symptomCheckIns,
        segments: visitSegments,
        documents,
      });
      setVoiceState('responding');
      addChatMessage(makeAssistantMessage(answer, mode));
      if (onboarding.spokenReplies && mode === 'voice') speak(answer);
    } catch {
      const answer = routeCorvasQuestion({
        text: trimmed,
        medications,
        weeks: recoveryWeeks,
        checkIns: symptomCheckIns,
        segments: visitSegments,
        documents,
      });
      addChatMessage(makeAssistantMessage(answer, mode));
      if (onboarding.spokenReplies && mode === 'voice') speak(answer);
    } finally {
      setVoiceState('idle');
    }
  }

  function toggleListening() {
    const nextPrompt = SIMULATED_VOICE_INPUTS[simulatedVoiceIndex % SIMULATED_VOICE_INPUTS.length];
    setSimulatedVoiceIndex((current) => current + 1);
    setVoiceState('listening');
    setVoiceTranscript('');
    setVoiceFollowups([]);

    window.setTimeout(() => {
      setVoiceTranscript(nextPrompt);
      setVoiceFollowups(generateVoiceFollowups(nextPrompt));
      setVoiceState('idle');
    }, 900);
  }

  function stopSimulatedVisit() {
    timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutIdsRef.current = [];
    setLiveVisitActive(false);
  }

  function startSimulatedVisit() {
    stopSimulatedVisit();
    setLiveVisitTranscript([]);
    setLiveVisitActive(true);

    let cumulativeDelay = 0;

    SIMULATED_LIVE_VISIT.forEach((entry, index) => {
      cumulativeDelay += 1400;
      const timeoutId = window.setTimeout(() => {
        setLiveVisitTranscript((current) => [...current, entry]);

        if (entry.linkedSegmentId) {
          setSelectedVisitSegmentId(entry.linkedSegmentId);
        }

        if (index === SIMULATED_LIVE_VISIT.length - 1) {
          setLiveVisitActive(false);
        }
      }, cumulativeDelay);

      timeoutIdsRef.current.push(timeoutId);
    });
  }

  async function uploadFromText() {
    const text = pastedText.trim();
    if (!text) return;
    const summary = simplifyDocument(uploadTitle.trim() || 'Uploaded document', text);
    addUploadedDocument(uploadTitle.trim() || 'Uploaded document', text, summary.plainSummary, summary.followUpQuestions);
    setPastedText('');
    setUploadTitle('My note');
  }

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    let rawText = '';
    if (file.type.startsWith('text/') || /\.(txt|md|json|csv)$/i.test(file.name)) {
      rawText = await file.text();
    }

    const summary = simplifyDocument(file.name, rawText);
    addUploadedDocument(file.name, rawText, summary.plainSummary, summary.followUpQuestions);
    event.target.value = '';
  }

  return (
    <div className="space-y-6">
      <ScreenTitle
        eyebrow="Ask CorVas"
        title="Speak naturally. CorVas should help, not perform."
        description="Ask general questions about the visit, what the doctor said, next steps, medications, symptoms, and common recovery concerns."
      />

      <SectionCard tone={carePanel === 'ask' || liveVisitActive ? 'highlight' : 'default'}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-teal-deep)]">
              Questions, visits, and paperwork
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              One place to ask, follow the visit, and understand what happened.
            </h2>
            <p className="mt-2 text-base leading-7 text-slate-700">
              Ask about the visit, load a spoken question, review the conversation, or simplify a document without bouncing between separate blocks.
            </p>
          </div>
          {carePanel === 'ask' ? (
            <button
              type="button"
              onClick={toggleListening}
              className={`flex h-18 w-18 items-center justify-center rounded-full border-4 ${
                voiceState === 'listening'
                  ? 'border-white bg-[var(--color-coral)] text-white shadow-[0_0_0_14px_rgba(223,112,91,0.18)]'
                  : 'border-white bg-[var(--color-teal-deep)] text-white'
              }`}
              aria-label="Simulate voice input"
            >
              {voiceState === 'listening' ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
            </button>
          ) : (
            <FileText className="h-6 w-6 text-[var(--color-teal-deep)]" />
          )}
        </div>

        <SegmentedTabs
          value={carePanel}
          onChange={setCarePanel}
          options={[
            { value: 'ask', label: 'Ask' },
            { value: 'live', label: 'Live visit' },
            { value: 'visit', label: 'Visit moments' },
            { value: 'documents', label: 'Documents' },
          ]}
          className="mt-5 sm:grid-cols-2 xl:grid-cols-4"
        />

        {carePanel === 'ask' ? (
          <>
            <div className="mt-5 rounded-[24px] border border-white/80 bg-white/88 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Status</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {voiceState === 'idle' && 'Ready when you are'}
                {voiceState === 'listening' && 'Loading a spoken question'}
                {voiceState === 'thinking' && 'Thinking through your question'}
                {voiceState === 'responding' && 'Replying'}
                {voiceState === 'error' && 'Voice help is unavailable'}
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                {voiceTranscript || 'Tap the mic to try: “I feel more short of breath today.”'}
              </p>

              {voiceTranscript ? (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <PrimaryButton onClick={() => handleAsk(voiceTranscript, 'voice')}>
                    Ask with this
                  </PrimaryButton>
                  <SecondaryButton onClick={() => setVoiceTranscript('')}>
                    Clear
                  </SecondaryButton>
                  <SecondaryButton onClick={() => setActiveTab('support')}>
                    Draft doctor message
                  </SecondaryButton>
                </div>
              ) : null}
            </div>

            {voiceFollowups.length ? (
              <div className="mt-5 rounded-[24px] bg-white/82 p-5">
                <div className="flex items-center gap-2 text-[var(--color-teal-deep)]">
                  <WandSparkles className="h-5 w-5" />
                  <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                    Possible next questions
                  </p>
                </div>
                <div className="mt-4 grid gap-3">
                  {voiceFollowups.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => handleAsk(question, 'text')}
                      className="rounded-[18px] border border-[var(--color-panel-border)] bg-white px-4 py-3 text-left text-base font-medium text-slate-800"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {SUGGESTIONS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleAsk(prompt, 'text')}
                  className="min-h-12 rounded-[20px] border border-[var(--color-panel-border)] bg-white px-4 py-3 text-left text-base font-medium text-slate-800"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-[24px] bg-white/82 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Type your own question
                </p>
                <Sparkles className="h-5 w-5 text-[var(--color-teal-deep)]" />
              </div>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="mt-4 min-h-28 w-full rounded-[24px] border border-[var(--color-panel-border)] px-4 py-4 text-lg text-slate-900 outline-none placeholder:text-slate-400 focus:border-[var(--color-teal-deep)]"
                placeholder="Ask in your own words."
              />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <PrimaryButton onClick={() => handleAsk(input, 'text')}>Ask CorVas</PrimaryButton>
                <SecondaryButton onClick={() => setActiveTab('support')}>I need human help</SecondaryButton>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] bg-white/82 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                {recentQuestions.length ? 'Recent questions' : 'Try asking'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(recentQuestions.length
                  ? recentQuestions.map((message) => message.text)
                  : SIMULATED_VOICE_INPUTS.slice(0, 3)
                ).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      if (recentQuestions.length) {
                        handleAsk(prompt, 'text');
                        return;
                      }
                      setVoiceTranscript(prompt);
                      setVoiceFollowups(generateVoiceFollowups(prompt));
                    }}
                    className="min-h-11 rounded-full border border-[var(--color-panel-border)] bg-white px-4 text-sm font-medium text-slate-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : carePanel === 'live' ? (
          <>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {liveVisitActive ? (
                <button
                  type="button"
                  onClick={stopSimulatedVisit}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-coral)] px-5 text-base font-semibold text-white"
                >
                  <Square className="h-5 w-5" />
                  Stop recording
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startSimulatedVisit}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-teal-deep)] px-5 text-base font-semibold text-white"
                >
                  <Play className="h-5 w-5" />
                  Start recording
                </button>
              )}
              <SecondaryButton
                onClick={() => {
                  setCarePanel('visit');
                  if (selectedVisit?.id) {
                    setSelectedVisitSegmentId(selectedVisit.id);
                  }
                }}
              >
                Review key moments
              </SecondaryButton>
            </div>

            <div className="mt-5 space-y-3">
              {liveVisitTranscript.length ? (
                liveVisitTranscript.map((entry) => (
                  <div
                    key={entry.id}
                    className={`rounded-[22px] px-4 py-4 ${
                      entry.speaker === 'doctor'
                        ? 'border border-[var(--color-panel-border)] bg-white'
                        : 'bg-[var(--color-panel-soft)]'
                    }`}
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {entry.speaker === 'doctor' ? 'Doctor' : 'Patient'}
                    </p>
                    <p className="mt-2 text-base leading-7 text-slate-800">{entry.text}</p>
                    {entry.linkedSegmentId ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (entry.linkedSegmentId) {
                            setCarePanel('visit');
                            setSelectedVisitSegmentId(entry.linkedSegmentId);
                          }
                        }}
                        className="mt-3 rounded-full border border-[var(--color-panel-border)] bg-[var(--color-panel-highlight)] px-4 py-2 text-sm font-semibold text-slate-900"
                      >
                        Explain this moment
                      </button>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] bg-[var(--color-panel-soft)] px-4 py-4 text-base leading-7 text-slate-700">
                  Start recording to follow a visit conversation and open the most important moments in plain language.
                </div>
              )}
            </div>
          </>
        ) : carePanel === 'visit' ? (
          <>
            <div className="mt-5 space-y-3">
              {visitSegments.map((segment) => (
                <button
                  key={segment.id}
                  type="button"
                  onClick={() => setSelectedVisitSegmentId(segment.id)}
                  className={`w-full rounded-[22px] border px-4 py-4 text-left ${
                    selectedVisitSegmentId === segment.id
                      ? 'border-[var(--color-teal-deep)] bg-[var(--color-panel-highlight)]'
                      : 'border-[var(--color-panel-border)] bg-white'
                  }`}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{segment.title}</p>
                  <p className="mt-2 text-base leading-7 text-slate-800">{segment.clinicalText}</p>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-[24px] bg-[var(--color-panel-soft)] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-teal-deep)]">Simple version</p>
              <p className="mt-3 text-base leading-7 text-slate-800">{selectedVisit.simpleText}</p>
              <div className="mt-4 space-y-2">
                {selectedVisit.followUpQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => handleAsk(question, 'text')}
                    className="block w-full rounded-[18px] bg-white px-4 py-3 text-left text-sm font-medium text-slate-700"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mt-5 space-y-3">
              {documents.slice(0, 4).map((document) => (
                <button
                  key={document.id}
                  type="button"
                  onClick={() => setActiveDocumentId(document.id)}
                  className={`w-full rounded-[22px] border px-4 py-4 text-left ${
                    activeDocumentId === document.id
                      ? 'border-[var(--color-teal-deep)] bg-[var(--color-panel-highlight)]'
                      : 'border-[var(--color-panel-border)] bg-white'
                  }`}
                >
                  <p className="text-base font-semibold text-slate-900">{document.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatLongDate(document.createdAt)}</p>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-[24px] bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-teal-deep)]">Plain-language summary</p>
              <p className="mt-3 text-base leading-7 text-slate-800">{selectedDocument.plainSummary}</p>
              <div className="mt-4 space-y-2">
                {selectedDocument.followUpQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => handleAsk(question, 'text')}
                    className="block w-full rounded-[18px] border border-[var(--color-panel-border)] px-4 py-3 text-left text-sm font-medium text-slate-700"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-3 rounded-[24px] border border-dashed border-[var(--color-panel-border)] bg-[var(--color-panel-soft)] p-5">
              <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <Upload className="h-5 w-5 text-[var(--color-teal-deep)]" />
                Add your own note or text file
              </div>
              <input
                value={uploadTitle}
                onChange={(event) => setUploadTitle(event.target.value)}
                className="h-12 w-full rounded-[18px] border border-[var(--color-panel-border)] px-4 text-base text-slate-900 outline-none focus:border-[var(--color-teal-deep)]"
                placeholder="Document title"
              />
              <textarea
                value={pastedText}
                onChange={(event) => setPastedText(event.target.value)}
                className="min-h-28 w-full rounded-[18px] border border-[var(--color-panel-border)] px-4 py-4 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-[var(--color-teal-deep)]"
                placeholder="Paste document text here for a simple summary."
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <PrimaryButton onClick={uploadFromText}>Summarize pasted text</PrimaryButton>
                <label className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-[var(--color-panel-border)] bg-white px-5 py-3 text-base font-semibold text-slate-800">
                  Upload text file
                  <input type="file" accept=".txt,.md,.json,.csv,text/plain" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}
