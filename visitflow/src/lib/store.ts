'use client';
import { create } from 'zustand';
import type {
  RiskLevel,
  TranscriptLine,
  Alert,
  HealthMetric,
  Message,
  NotificationItem,
  MedicationReminder,
} from './types';
import {
  PATIENT, CURRENT_VISIT, TODAY_REHAB, MOCK_ALERTS,
  MOCK_MESSAGES, HEALTH_METRICS, NOTIFICATIONS, MEDICATION_REMINDERS
} from './mock-data';

interface AppState {
  // Patient
  patient: typeof PATIENT;
  riskLevel: RiskLevel;

  // Visit
  currentVisit: typeof CURRENT_VISIT;
  liveTranscript: TranscriptLine[];
  isRecording: boolean;
  visitElapsed: number; // seconds
  expandedLineId: string | null;

  // Audio
  doctorMuted: boolean;
  aiAudioEnabled: boolean;

  // Rehab
  todayRehab: typeof TODAY_REHAB;
  activeTaskId: string | null;
  cardioStressMode: boolean;
  currentHR: number;
  currentSteps: number;

  // Alerts
  alerts: Alert[];
  activeAlert: Alert | null;

  // Messaging
  messages: Message[];

  // Notifications
  notifications: NotificationItem[];

  // Medication reminders
  medicationReminders: MedicationReminder[];

  // Health metrics
  metrics: HealthMetric[];

  // Nav
  activeView: string;

  // Actions
  setActiveView: (view: string) => void;
  setRiskLevel: (level: RiskLevel) => void;
  addTranscriptLine: (line: TranscriptLine) => void;
  clearTranscript: () => void;
  setExpandedLine: (id: string | null) => void;
  setIsRecording: (val: boolean) => void;
  setVisitElapsed: (s: number) => void;
  toggleDoctorMuted: () => void;
  toggleAiAudio: () => void;
  completeTask: (taskId: string) => void;
  setActiveTask: (id: string | null) => void;
  setCurrentHR: (hr: number) => void;
  setCurrentSteps: (steps: number) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (id: string) => void;
  setActiveAlert: (alert: Alert | null) => void;
  addMessage: (msg: Message) => void;
  addNotification: (note: NotificationItem) => void;
  markNotificationRead: (id: string) => void;
  markMedicationTaken: (id: string) => void;
  markMedicationMissed: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  patient: PATIENT,
  riskLevel: 'green',
  currentVisit: CURRENT_VISIT,
  liveTranscript: [],
  isRecording: false,
  visitElapsed: 0,
  expandedLineId: null,
  doctorMuted: false,
  aiAudioEnabled: false,
  todayRehab: TODAY_REHAB,
  activeTaskId: null,
  cardioStressMode: false,
  currentHR: 72,
  currentSteps: 4820,
  alerts: MOCK_ALERTS,
  activeAlert: null,
  messages: MOCK_MESSAGES,
  notifications: NOTIFICATIONS,
  medicationReminders: MEDICATION_REMINDERS,
  metrics: HEALTH_METRICS,
  activeView: 'overview',

  setActiveView: (view) => set({ activeView: view }),
  setRiskLevel: (level) => set({ riskLevel: level }),
  addTranscriptLine: (line) =>
    set((s) => ({ liveTranscript: [...s.liveTranscript, line] })),
  clearTranscript: () => set({ liveTranscript: [], expandedLineId: null }),
  setExpandedLine: (id) => set({ expandedLineId: id }),
  setIsRecording: (val) => set({ isRecording: val }),
  setVisitElapsed: (s) => set({ visitElapsed: s }),
  toggleDoctorMuted: () => set((s) => ({ doctorMuted: !s.doctorMuted })),
  toggleAiAudio: () => set((s) => ({ aiAudioEnabled: !s.aiAudioEnabled })),
  completeTask: (taskId) =>
    set((s) => ({
      todayRehab: {
        ...s.todayRehab,
        tasks: s.todayRehab.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: true, completedAt: new Date() } : t
        ),
      },
    })),
  setActiveTask: (id) => set({ activeTaskId: id }),
  setCurrentHR: (hr) => set({ currentHR: hr }),
  setCurrentSteps: (steps) => set({ currentSteps: steps }),
  addAlert: (alert) => set((s) => ({ alerts: [alert, ...s.alerts] })),
  acknowledgeAlert: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)),
    })),
  setActiveAlert: (alert) => set({ activeAlert: alert }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  addNotification: (note) => set((s) => ({ notifications: [note, ...s.notifications] })),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markMedicationTaken: (id) =>
    set((s) => ({
      medicationReminders: s.medicationReminders.map((r) =>
        r.id === id ? { ...r, taken: true, missed: false } : r
      ),
    })),
  markMedicationMissed: (id) =>
    set((s) => ({
      medicationReminders: s.medicationReminders.map((r) =>
        r.id === id ? { ...r, taken: false, missed: true } : r
      ),
    })),
}));
