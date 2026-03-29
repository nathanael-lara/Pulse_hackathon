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
  name: string;
  dose: string;
  frequency: string;
  purpose: string;
  sideEffects?: string[];
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
}

export interface Peer {
  id: string;
  name: string;
  weekInProgram: number;
  milestone?: string;
  message?: string;
  avatar?: string;
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
