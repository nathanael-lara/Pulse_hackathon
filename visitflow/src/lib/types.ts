export type AppTab = 'today' | 'ask' | 'recovery' | 'medications' | 'support';

export type RiskTier = 'steady' | 'watch' | 'support' | 'urgent';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'responding' | 'error';

export type ContactRole = 'family' | 'care-team' | 'coach' | 'support';

export interface PatientProfile {
  id: string;
  fullName: string;
  preferredName: string;
  age: number;
  programWeek: number;
  recoveryGoal: string;
  diagnosisSummary: string;
  nextVisitDate: string;
  careTeamName: string;
}

export interface CareContact {
  id: string;
  name: string;
  role: ContactRole;
  relationship: string;
  phone: string;
  availability: string;
  escalationLevel: Exclude<RiskTier, 'steady'>[];
  videoLink?: string;
  aiPromptHelp?: string[];
}

export interface OnboardingState {
  completed: boolean;
  preferredName: string;
  recoveryGoal: string;
  comfortWithTech: 'gentle' | 'standard';
  reminderStyle: 'gentle' | 'spoken' | 'both';
  largeText: boolean;
  spokenReplies: boolean;
  caregiverUpdates: boolean;
  autoAlertCareTeam: boolean;
  shareLocationForAlerts: boolean;
  emergencyContactId: string;
  locationLabel: string;
}

// Anti-cheat verification system
export interface VerificationData {
  method: 'device-unlock' | 'geolocation' | 'heart-rate' | 'timestamp-window';
  verified: boolean;
  timestamp: string;
  details?: Record<string, unknown>; // geo coords, HR value, etc
}

export interface MedicationDoseLog {
  id: string;
  medicationId: string;
  scheduledAt: string;
  status: 'due' | 'taken' | 'skipped' | 'snoozed';
  loggedAt?: string;
  verifications?: VerificationData[]; // Device unlock + time window
  unverifiedAttempts?: number; // Track failed verification attempts
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  purpose: string;
  instructions: string;
  schedule: string[];
  refillDate?: string;
  doses: MedicationDoseLog[];
}

export interface RecoverySession {
  id: string;
  week: number;
  dayLabel: string;
  title: string;
  description: string;
  durationMinutes: number;
  target: string;
  status: 'completed' | 'today' | 'upcoming' | 'missed';
  completedAt?: string;
}

export interface RecoveryWeek {
  week: number;
  focus: string;
  milestone: string;
  status: 'completed' | 'current' | 'upcoming';
  sessions: RecoverySession[];
}

export interface RecoverySetback {
  id: string;
  createdAt: string;
  reason: 'fatigue' | 'transport' | 'worry' | 'symptoms' | 'schedule';
  note: string;
}

export interface SymptomCheckIn {
  id: string;
  createdAt: string;
  breathlessness: number;
  dizziness: number;
  fatigue: number;
  chestDiscomfort: number;
  worry: number;
  note: string;
}

export interface SupportMessage {
  id: string;
  sender: 'patient' | 'contact' | 'corvas';
  contactId?: string;
  body: string;
  createdAt: string;
  urgent?: boolean;
}

export interface CommunitySupportMember {
  id: string;
  name: string;
  role: 'former-patient' | 'volunteer-driver' | 'care-coach';
  area: string;
  distanceMiles: number;
  availability: string;
  canDrive: boolean;
  note: string;
}

export interface ProviderMatch {
  id: string;
  name: string;
  specialty: string;
  distanceMiles: number;
  etaMinutes: number;
  offersVideo: boolean;
  whyItFits: string;
  videoLink?: string;
}

export interface TransportOption {
  id: string;
  name: string;
  type: 'community-van' | 'peer-driver' | 'rideshare-support' | 'telehealth-fallback';
  maxDistanceMiles: number;
  bookingLead: string;
  details: string;
}

export interface EscalationEvent {
  id: string;
  tier: Exclude<RiskTier, 'steady'>;
  createdAt: string;
  title: string;
  message: string;
  actionLabel: string;
}

export interface VisitSegment {
  id: string;
  speaker: 'doctor' | 'patient' | 'corvas';
  title: string;
  clinicalText: string;
  simpleText: string;
  followUpQuestions: string[];
  tags: string[];
}

export interface DocumentItem {
  id: string;
  title: string;
  source: 'visit-summary' | 'lab' | 'prescription' | 'upload';
  createdAt: string;
  plainSummary: string;
  followUpQuestions: string[];
  rawText?: string;
}

export interface CorvasChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
  mode: 'voice' | 'text';
}

export interface DailyBrief {
  headline: string;
  encouragement: string;
  nextBestAction: string;
}

export interface PreVisitPrepQuestion {
  id: string;
  question: string;
  category: 'symptom' | 'medication' | 'activity' | 'diet' | 'concern';
  priority: 'high' | 'medium' | 'low';
  aiGenerated: boolean;
  answered: boolean;
  patientNote?: string;
}

export interface PreVisitPrepSession {
  id: string;
  visitDate: string;
  generatedAt: string;
  questions: PreVisitPrepQuestion[];
  patientSummaryForDoctor?: string;
}

export interface LiveTranscriptSegment {
  id: string;
  timestamp: string;
  rawText: string;
  clinicalMoment?: string;
  simpleExplanation?: string;
  isExtracted: boolean;
}

export interface LiveTranscriptionSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  segments: LiveTranscriptSegment[];
  visitDate: string;
}

export interface MealLogEntry {
  id: string;
  createdAt: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  sodiumMg: number;
  caloriesEstimate?: number;
  presetMealId?: string;
  notes?: string;
}

export interface PresetMeal {
  id: string;
  name: string;
  sodiumMg: number;
  caloriesEstimate: number;
  description: string;
}

export interface DailyNutritionSummary {
  date: string;
  totalSodiumMg: number;
  mealCount: number;
  sodiumBudgetMg: number;
  adherentToMediterranean: boolean;
}

export type WearableDataSource = 'manual' | 'mock-apple-health' | 'mock-google-fit';

export type HRZone = 'zone1' | 'zone2' | 'zone3' | 'zone4';

export interface WearableSession {
  id: string;
  createdAt: string;
  source: WearableDataSource;
  activityType: 'walk' | 'swim' | 'bike' | 'stretch' | 'rest';
  durationMinutes: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  steps?: number;
  hrZone?: HRZone;
  exceededSafeThreshold: boolean;
  notes?: string;
  // Anti-cheat verification (optional - only set if verified)
  isVerified?: boolean;
  verifications?: VerificationData[];
}

export type NotificationType = 'medication' | 'daily-brief' | 'checkin-reminder' | 'visit-prep';

export interface ScheduledNotification {
  id: string;
  type: NotificationType;
  scheduledFor: string;
  title: string;
  body: string;
  delivered: boolean;
  notificationTimestamp?: string; // When notification was actually shown (for latency tracking)
}

export interface WorkoutSession {
  id: string;
  createdAt: string;
  activityType: 'walk' | 'swim' | 'bike' | 'stretch' | 'rest';
  durationMinutes: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  steps?: number;
  hrZone?: HRZone;
  exceededSafeThreshold: boolean;
  verifications?: VerificationData[]; // Geolocation + HR validation
  isVerified: boolean;
  notes?: string;
}

export interface SuspiciousActivityScore {
  userId: string;
  scorePercentage: number; // 0-100
  flags: {
    consistentQuickClicks: boolean; // Always clicks <3 sec after notification
    alwaysLogsWithinWindow: boolean; // Suspiciously perfect timing
    noHRDataOnWorkouts: boolean; // Claims workouts but never logs HR
    noGeoVariation: boolean; // Always logs from same location
  };
  lastUpdated: string;
  escalationTriggered: boolean;
}
