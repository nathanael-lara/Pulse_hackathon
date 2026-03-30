'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  CARE_CONTACTS,
  DAILY_BRIEF,
  DEFAULT_ONBOARDING,
  DEMO_PATIENT,
  DOCUMENTS,
  INITIAL_CHAT,
  INITIAL_CHECK_INS,
  INITIAL_MEAL_LOGS,
  INITIAL_SETBACKS,
  INITIAL_SUPPORT_MESSAGES,
  INITIAL_WEARABLE_SESSIONS,
  MEDICATIONS,
  RECOVERY_WEEKS,
  VISIT_SEGMENTS,
} from '@/lib/mock-data';
import { buildEscalations } from '@/lib/corvas-logic';
import { makeId } from '@/lib/utils';
import type {
  AppTab,
  CareContact,
  CorvasChatMessage,
  DailyBrief,
  DocumentItem,
  LiveTranscriptionSession,
  LiveTranscriptSegment,
  MealLogEntry,
  Medication,
  OnboardingState,
  PatientProfile,
  PreVisitPrepQuestion,
  PreVisitPrepSession,
  RecoverySetback,
  RecoveryWeek,
  ScheduledNotification,
  SupportRequest,
  SupportMessage,
  SuspiciousActivityScore,
  SymptomCheckIn,
  VisitSegment,
  WearableSession,
} from '@/lib/types';

interface AppState {
  hydrated: boolean;
  activeTab: AppTab;
  patient: PatientProfile;
  onboarding: OnboardingState;
  dailyBrief: DailyBrief;
  contacts: CareContact[];
  medications: Medication[];
  recoveryWeeks: RecoveryWeek[];
  setbacks: RecoverySetback[];
  symptomCheckIns: SymptomCheckIn[];
  supportMessages: SupportMessage[];
  supportRequests: SupportRequest[];
  visitSegments: VisitSegment[];
  documents: DocumentItem[];
  activeDocumentId: string;
  selectedVisitSegmentId: string;
  chatHistory: CorvasChatMessage[];
  escalations: ReturnType<typeof buildEscalations>;
  preVisitPrep: PreVisitPrepSession | null;
  liveTranscription: LiveTranscriptionSession | null;
  mealLogs: MealLogEntry[];
  sodiumBudgetMg: number;
  wearableSessions: WearableSession[];
  addWearableSession: (entry: Omit<WearableSession, 'id' | 'createdAt'>) => void;
  removeWearableSession: (id: string) => void;
  notificationPermission: NotificationPermission;
  scheduledNotifications: ScheduledNotification[];
  suspiciousActivityScore: SuspiciousActivityScore | null;
  lastUrgentEscalationKey?: string;
  setNotificationPermission: (permission: NotificationPermission) => void;
  updateSuspiciousActivityScore: (score: SuspiciousActivityScore) => void;
  updateDailyBriefRefreshTime: (timestamp: string) => void;
  lastDailyBriefRefresh?: string;
  setHydrated: (value: boolean) => void;
  setActiveTab: (tab: AppTab) => void;
  updateOnboarding: (updates: Partial<OnboardingState>) => void;
  completeOnboarding: () => void;
  reopenOnboarding: () => void;
  markDoseStatus: (doseId: string, status: 'taken' | 'skipped' | 'snoozed') => void;
  completeRecoverySession: (sessionId: string) => void;
  logRecoverySetback: (reason: RecoverySetback['reason'], note: string) => void;
  addSymptomCheckIn: (payload: Omit<SymptomCheckIn, 'id' | 'createdAt'>) => void;
  addSupportMessage: (body: string, contactId?: string, urgent?: boolean, responseOverride?: string) => void;
  createSupportRequest: (request: Omit<SupportRequest, 'id' | 'requestedAt' | 'status'>) => void;
  connectSupportRequest: (requestId: string) => void;
  sendEscalationOutreach: (params: {
    contactId: string;
    summary: string;
    source: 'auto-caregiver' | 'auto-care-team' | 'manual-caregiver';
  }) => void;
  markUrgentEscalationHandled: (key?: string) => void;
  addChatMessage: (message: CorvasChatMessage) => void;
  addUploadedDocument: (title: string, rawText: string, plainSummary: string, followUpQuestions: string[]) => void;
  setActiveDocumentId: (documentId: string) => void;
  setSelectedVisitSegmentId: (segmentId: string) => void;
  setPreVisitPrep: (session: PreVisitPrepSession) => void;
  markPrepQuestionAnswered: (questionId: string, note?: string) => void;
  startLiveTranscription: () => void;
  addTranscriptSegment: (segment: LiveTranscriptSegment) => void;
  endLiveTranscription: () => void;
  addMealLog: (entry: Omit<MealLogEntry, 'id' | 'createdAt'>) => void;
  removeMealLog: (id: string) => void;
}

function withEscalations(state: Pick<AppState, 'medications' | 'recoveryWeeks' | 'symptomCheckIns' | 'setbacks'>) {
  return buildEscalations({
    medications: state.medications,
    weeks: state.recoveryWeeks,
    checkIns: state.symptomCheckIns,
    setbacks: state.setbacks,
  });
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hydrated: false,
      activeTab: 'today',
      patient: DEMO_PATIENT,
      onboarding: DEFAULT_ONBOARDING,
      dailyBrief: DAILY_BRIEF,
      contacts: CARE_CONTACTS,
      medications: MEDICATIONS,
      recoveryWeeks: RECOVERY_WEEKS,
      setbacks: INITIAL_SETBACKS,
      symptomCheckIns: INITIAL_CHECK_INS,
      supportMessages: INITIAL_SUPPORT_MESSAGES,
      supportRequests: [],
      visitSegments: VISIT_SEGMENTS,
      documents: DOCUMENTS,
      activeDocumentId: DOCUMENTS[0]?.id ?? '',
      selectedVisitSegmentId: VISIT_SEGMENTS[0]?.id ?? '',
      chatHistory: INITIAL_CHAT,
      escalations: buildEscalations({
        medications: MEDICATIONS,
        weeks: RECOVERY_WEEKS,
        checkIns: INITIAL_CHECK_INS,
        setbacks: INITIAL_SETBACKS,
      }),
      preVisitPrep: null,
      liveTranscription: null,
      mealLogs: INITIAL_MEAL_LOGS,
      sodiumBudgetMg: 1500,
      wearableSessions: INITIAL_WEARABLE_SESSIONS,
      notificationPermission: 'default' as NotificationPermission,
      scheduledNotifications: [],
      suspiciousActivityScore: null,
      lastUrgentEscalationKey: undefined,
      lastDailyBriefRefresh: undefined,

      setHydrated: (value) => set({ hydrated: value }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      updateOnboarding: (updates) =>
        set((state) => ({
          onboarding: { ...state.onboarding, ...updates },
          patient: {
            ...state.patient,
            preferredName: updates.preferredName ?? state.patient.preferredName,
            recoveryGoal: updates.recoveryGoal ?? state.patient.recoveryGoal,
          },
        })),

      completeOnboarding: () =>
        set((state) => ({
          onboarding: { ...state.onboarding, completed: true },
          patient: {
            ...state.patient,
            preferredName: state.onboarding.preferredName,
            recoveryGoal: state.onboarding.recoveryGoal,
          },
        })),

      reopenOnboarding: () =>
        set((state) => ({
          onboarding: { ...state.onboarding, completed: false },
        })),

      markDoseStatus: (doseId, status) =>
        set((state) => {
          const medications = state.medications.map((medication) => ({
            ...medication,
            doses: medication.doses.map((dose) =>
              dose.id === doseId
                ? {
                    ...dose,
                    status,
                    loggedAt: new Date().toISOString(),
                  }
                : dose
            ),
          }));

          const nextState = {
            ...state,
            medications,
          };

          return {
            medications,
            escalations: withEscalations(nextState),
          };
        }),

      completeRecoverySession: (sessionId) =>
        set((state) => {
          const recoveryWeeks = state.recoveryWeeks.map((week) => ({
            ...week,
            sessions: week.sessions.map((session) =>
              session.id === sessionId
                ? {
                    ...session,
                    status: 'completed' as const,
                    completedAt: new Date().toISOString(),
                  }
                : session
            ),
          }));

          const nextState = {
            ...state,
            recoveryWeeks,
          };

          return {
            recoveryWeeks,
            escalations: withEscalations(nextState),
          };
        }),

      logRecoverySetback: (reason, note) =>
        set((state) => {
          const setbacks = [
            {
              id: makeId('setback'),
              createdAt: new Date().toISOString(),
              reason,
              note,
            },
            ...state.setbacks,
          ];

          const nextState = {
            ...state,
            setbacks,
          };

          return {
            setbacks,
            escalations: withEscalations(nextState),
          };
        }),

      addSymptomCheckIn: (payload) =>
        set((state) => {
          const symptomCheckIns = [
            {
              id: makeId('checkin'),
              createdAt: new Date().toISOString(),
              ...payload,
            },
            ...state.symptomCheckIns,
          ];

          const nextState = {
            ...state,
            symptomCheckIns,
          };

          return {
            symptomCheckIns,
            escalations: withEscalations(nextState),
          };
        }),

      addSupportMessage: (body, contactId, urgent, responseOverride) =>
        set((state) => {
          const contactName = state.contacts.find((contact) => contact.id === contactId)?.name;
          const patientMessage = {
            id: makeId('support'),
            sender: 'patient' as const,
            contactId,
            body,
            urgent,
            createdAt: new Date().toISOString(),
          };

          const corvasReply = {
            id: makeId('support'),
            sender: 'corvas' as const,
            contactId,
            urgent,
            createdAt: new Date().toISOString(),
            body: responseOverride
              ?? (urgent
                ? `I marked this as urgent and moved it to the top for ${contactName ?? 'the care team'}. If symptoms feel severe right now, call immediately.`
                : `Your update is ready for ${contactName ?? 'the care team'}. You can keep using this thread if anything changes.`),
          };

          return {
            supportMessages: [...state.supportMessages, patientMessage, corvasReply],
          };
        }),

      createSupportRequest: (request) =>
        set((state) => ({
          supportRequests: [
            ...state.supportRequests.filter((item) => !(item.kind === request.kind && item.targetId === request.targetId && item.status !== 'connected')),
            {
              ...request,
              id: makeId('support-request'),
              requestedAt: new Date().toISOString(),
              status: 'pending',
            },
          ],
        })),

      connectSupportRequest: (requestId) =>
        set((state) => {
          const targetRequest = state.supportRequests.find((request) => request.id === requestId);
          if (!targetRequest || targetRequest.status === 'connected') return {};

          let contacts = state.contacts;
          let contactId = targetRequest.contactId;

          if (targetRequest.kind !== 'transport' && targetRequest.phone) {
            const existingContact = state.contacts.find(
              (contact) => contact.name === targetRequest.targetName || contact.id === targetRequest.contactId
            );

            if (existingContact) {
              contactId = existingContact.id;
            } else {
              contactId = `connected-${targetRequest.kind}-${targetRequest.targetId}`;
              contacts = [
                ...state.contacts,
                {
                  id: contactId,
                  name: targetRequest.targetName,
                  role: targetRequest.kind === 'provider' ? 'care-team' : 'community',
                  relationship: targetRequest.relationshipLabel ?? (targetRequest.kind === 'provider' ? 'Follow-up option' : 'Community support'),
                  phone: targetRequest.phone,
                  availability: targetRequest.availability ?? 'Reply expected soon',
                  escalationLevel: ['support', 'urgent'],
                  videoLink: targetRequest.videoLink,
                  aiPromptHelp: targetRequest.messagePrompt ? [targetRequest.messagePrompt] : undefined,
                },
              ];
            }
          }

          return {
            contacts,
            supportRequests: state.supportRequests.map((request) =>
              request.id === requestId
                ? {
                    ...request,
                    status: 'connected',
                    contactId,
                  }
                : request
            ),
            supportMessages: [
              ...state.supportMessages,
              {
                id: makeId('support'),
                sender: 'corvas',
                contactId,
                urgent: false,
                createdAt: new Date().toISOString(),
                body: targetRequest.connectedText,
              },
            ],
          };
        }),

      sendEscalationOutreach: ({ contactId, summary, source }) =>
        set((state) => {
          const contact = state.contacts.find((item) => item.id === contactId);
          if (!contact) return {};

          const sentBody =
            source === 'auto-caregiver'
              ? `Urgent alert shared with ${contact.name}: ${summary}`
              : source === 'auto-care-team'
                ? `Urgent clinical update sent to ${contact.name}: ${summary}`
                : `Urgent update sent to ${contact.name}: ${summary}`;

          const replyBody =
            contact.role === 'family'
              ? `${contact.name} was notified and is checking in now.`
              : `${contact.name} was notified with the urgent summary and can follow up.`;

          return {
            supportMessages: [
              ...state.supportMessages,
              {
                id: makeId('support'),
                sender: 'corvas',
                contactId,
                body: sentBody,
                urgent: true,
                createdAt: new Date().toISOString(),
              },
              {
                id: makeId('support'),
                sender: 'contact',
                contactId,
                body: replyBody,
                urgent: true,
                createdAt: new Date(Date.now() + 1000).toISOString(),
              },
            ],
          };
        }),

      markUrgentEscalationHandled: (key) =>
        set({
          lastUrgentEscalationKey: key,
        }),

      addChatMessage: (message) =>
        set((state) => ({
          chatHistory: [...state.chatHistory, message],
        })),

      addUploadedDocument: (title, rawText, plainSummary, followUpQuestions) =>
        set((state) => {
          const id = makeId('document');
          return {
            documents: [
              {
                id,
                title,
                source: 'upload',
                createdAt: new Date().toISOString(),
                rawText,
                plainSummary,
                followUpQuestions,
              },
              ...state.documents,
            ],
            activeDocumentId: id,
          };
        }),

      setActiveDocumentId: (documentId) => set({ activeDocumentId: documentId }),
      setSelectedVisitSegmentId: (segmentId) => set({ selectedVisitSegmentId: segmentId }),

      setPreVisitPrep: (session) => set({ preVisitPrep: session }),

      markPrepQuestionAnswered: (questionId, note) =>
        set((state) => {
          if (!state.preVisitPrep) return {};
          return {
            preVisitPrep: {
              ...state.preVisitPrep,
              questions: state.preVisitPrep.questions.map((q) =>
                q.id === questionId
                  ? {
                      ...q,
                      answered: true,
                      patientNote: note,
                    }
                  : q
              ),
            },
          };
        }),

      startLiveTranscription: () =>
        set({
          liveTranscription: {
            id: makeId('transcription'),
            startedAt: new Date().toISOString(),
            segments: [],
            visitDate: new Date().toISOString(),
          },
        }),

      addTranscriptSegment: (segment) =>
        set((state) => {
          if (!state.liveTranscription) return {};
          return {
            liveTranscription: {
              ...state.liveTranscription,
              segments: [...state.liveTranscription.segments, segment],
            },
          };
        }),

      endLiveTranscription: () =>
        set((state) => {
          if (!state.liveTranscription) return {};
          return {
            liveTranscription: {
              ...state.liveTranscription,
              endedAt: new Date().toISOString(),
            },
          };
        }),

      addMealLog: (entry) =>
        set((state) => ({
          mealLogs: [
            {
              id: makeId('meal'),
              createdAt: new Date().toISOString(),
              ...entry,
            },
            ...state.mealLogs,
          ],
        })),

      removeMealLog: (id) =>
        set((state) => ({
          mealLogs: state.mealLogs.filter((meal) => meal.id !== id),
        })),

      addWearableSession: (entry) =>
        set((state) => ({
          wearableSessions: [
            {
              id: makeId('wearable'),
              createdAt: new Date().toISOString(),
              ...entry,
            },
            ...state.wearableSessions,
          ],
        })),

      removeWearableSession: (id) =>
        set((state) => ({
          wearableSessions: state.wearableSessions.filter((session) => session.id !== id),
        })),

      setNotificationPermission: (permission) =>
        set({
          notificationPermission: permission,
        }),

      updateSuspiciousActivityScore: (score) =>
        set({
          suspiciousActivityScore: score,
        }),

      updateDailyBriefRefreshTime: (timestamp) =>
        set({
          lastDailyBriefRefresh: timestamp,
        }),
    }),
    {
      name: 'corvas-pwa-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeTab: state.activeTab,
        patient: state.patient,
        onboarding: state.onboarding,
        medications: state.medications,
        recoveryWeeks: state.recoveryWeeks,
        setbacks: state.setbacks,
        symptomCheckIns: state.symptomCheckIns,
        supportMessages: state.supportMessages,
        supportRequests: state.supportRequests,
        documents: state.documents,
        activeDocumentId: state.activeDocumentId,
        selectedVisitSegmentId: state.selectedVisitSegmentId,
        chatHistory: state.chatHistory,
        escalations: state.escalations,
        preVisitPrep: state.preVisitPrep,
        liveTranscription: state.liveTranscription,
        mealLogs: state.mealLogs,
        sodiumBudgetMg: state.sodiumBudgetMg,
        wearableSessions: state.wearableSessions,
        notificationPermission: state.notificationPermission,
        scheduledNotifications: state.scheduledNotifications,
        lastUrgentEscalationKey: state.lastUrgentEscalationKey,
        lastDailyBriefRefresh: state.lastDailyBriefRefresh,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
