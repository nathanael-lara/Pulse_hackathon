export type RiskLevel = 'green' | 'yellow' | 'orange' | 'red';

export interface TranscriptLine {
  id: string;
  timestamp: number; // seconds from start
  speaker: 'doctor' | 'patient' | 'ai';
  text: string;
  explanation?: string;
  tags?: Array<'diagnosis' | 'medication' | 'instruction' | 'risk' | 'followup'>;
  expanded?: boolean;
}

export interface Visit {
  id: string;
  date: string;
  doctor: string;
  specialty: string;
  duration: number; // minutes
  transcript: TranscriptLine[];
  summary?: VisitSummary;
  riskLevel: RiskLevel;
  status: 'scheduled' | 'live' | 'completed';
}

export interface VisitSummary {
  diagnosis: string[];
  medications: Medication[];
  instructions: string[];
  followUp: string;
  keyPoints: string[];
}

export interface Medication {
  id?: string;
  name: string;
  dose: string;
  frequency: string;
  purpose: string;
  sideEffects?: string[];
  scheduleTimes?: string[];
  adherenceRate?: number;
  nextDoseAt?: string;
  missedDoses?: number;
}

export interface HealthMetric {
  timestamp: Date;
  heartRate: number;
  steps: number;
  activity: 'resting' | 'light' | 'moderate' | 'vigorous';
  bloodPressure?: { systolic: number; diastolic: number };
}

export interface RehabTask {
  id: string;
  type: 'walk' | 'breathe' | 'stretch' | 'rest';
  title: string;
  description: string;
  duration: number; // minutes
  targetHR?: number;
  completed?: boolean;
  skipped?: boolean;
  completedAt?: Date;
}

export interface RehabDay {
  date: string;
  week: number;
  day: number;
  tasks: RehabTask[];
  cardioStress?: CardioStressResult;
  aiEncouragement?: string;
}

export interface CardioStressResult {
  status: 'optimal' | 'elevated' | 'high' | 'critical';
  currentHR: number;
  expectedHR: number;
  hrVariability: number;
  recommendation: string;
  shouldStop: boolean;
}

export interface Alert {
  id: string;
  timestamp: Date;
  level: RiskLevel;
  message: string;
  source: 'symptom' | 'hr' | 'transcript' | 'behavior';
  acknowledged: boolean;
  sentToContacts?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  notifyAt: Array<'orange' | 'red'>;
  avatar?: string;
}

export interface Message {
  id: string;
  from: 'patient' | 'doctor' | 'ai';
  text: string;
  timestamp: Date;
  linkedTo?: { type: 'visit' | 'medication' | 'rehab' | 'alert'; id: string };
  aiSuggested?: boolean;
  voiceNote?: {
    durationSec: number;
    transcript: string;
  };
}

export interface Peer {
  id: string;
  name: string;
  weekInProgram: number;
  milestone?: string;
  message?: string;
  avatar?: string;
  location?: string;
  canDrive?: boolean;
  trustLabel?: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  condition: string;
  rehabWeek: number;
  rehabDay: number;
  streakDays: number;
  milestones: string[];
  riskLevel: RiskLevel;
  contacts: Contact[];
}

export interface Symptom {
  id: string;
  name: string;
  severity: 1 | 2 | 3 | 4 | 5;
  duration: string;
  since: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  channel: 'in-app' | 'push' | 'sms';
  category: 'rehab' | 'medication' | 'alert' | 'encouragement';
  level?: RiskLevel | 'info';
  timestamp: Date;
  read: boolean;
}

export interface MedicationReminder {
  id: string;
  medicationId: string;
  medicationName: string;
  scheduledFor: string;
  taken: boolean;
  missed: boolean;
  snoozed?: boolean;
}

export interface RehabHistoryEntry {
  id: string;
  date: string;
  completed: boolean;
  minutes: number;
  steps: number;
  avgHR: number;
  maxHR: number;
  notes?: string;
}

export interface MedicalDocument {
  id: string;
  name: string;
  type: 'Visit' | 'Diagnostic' | 'Rehab' | 'Clinical' | 'Record' | 'Lab' | 'Prescription';
  date: string;
  size: string;
  summary: string;
  keyValues?: Array<{
    label: string;
    value: string;
    abnormal?: boolean;
    explanation: string;
  }>;
}

export interface CareLocation {
  id: string;
  name: string;
  kind: 'hospital' | 'cardiologist' | 'rehab-center';
  distanceMiles: number;
  etaMinutes: number;
  address: string;
  zipCode?: string;
  acceptsNewPatients?: boolean;
  summary?: string;
}

export interface TransportMatch {
  id: string;
  driverName: string;
  role: 'peer' | 'volunteer';
  distanceMiles: number;
  availability: string;
  trustLabel: string;
  seats: number;
  zipCode?: string;
  pickupArea?: string;
  supports?: Array<'rehab' | 'hospital' | 'cardiology'>;
}

export interface ProviderMatch {
  id: string;
  name: string;
  specialty: string;
  distanceMiles: number;
  etaMinutes: number;
  address: string;
  matchReason: string;
  acceptingPatients: boolean;
}

export interface CommunityTransportScenario {
  zipCode: string;
  placeName: string;
  address: string;
  kind: 'home' | 'hospital' | 'cardiologist' | 'rehab-center';
  etaMinutes: number;
  distanceMiles: number;
  source: 'google-maps-sim';
}

export interface RehabPlanSession {
  id: string;
  dayLabel: string;
  title: string;
  focus: string;
  durationMinutes: number;
  targetHR: number;
  status: 'completed' | 'today' | 'upcoming';
}

export interface RehabWeekPlan {
  week: number;
  title: string;
  focus: string;
  physicianGuardrails: string[];
  targetSteps: number;
  totalMinutes: number;
  sessions: RehabPlanSession[];
}

export interface CardioVoiceInput {
  voiceSeconds: number;
  spo2: number;
  baselineSpo2?: number;
  speechRate: number;
  pauseFrequency: number;
  phraseLength: number;
  inhaleExhaleTiming: number;
  breathInterruptions: number;
}

export interface CardioVoiceAssessment {
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  voiceFatigueScore: number;
  breathingIrregularity: number;
  spo2Impact: number;
  explanation: string[];
  recommendation: string;
}
