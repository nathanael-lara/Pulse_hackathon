import type {
  PatientProfile,
  OnboardingState,
  Medication,
  RecoveryWeek,
  SymptomCheckIn,
  VisitSegment,
  DocumentItem,
  CorvasChatMessage,
  RecoverySetback,
} from '@/lib/types';

/**
 * Serializable patient context package sent to LLM API routes.
 * This is the JSON body for all `/api/*` LLM calls.
 */
export interface PatientContextPackage {
  patient: PatientProfile;
  onboarding: OnboardingState;
  medications: Medication[];
  currentWeek: RecoveryWeek;
  recentCheckIns: SymptomCheckIn[];
  recentSetbacks: RecoverySetback[];
  visitSegments: VisitSegment[];
  documents: DocumentItem[];
  conversationHistory: CorvasChatMessage[];
}

/**
 * Builds a patient context package from Zustand store state.
 * Only includes essential data to keep API payloads lean.
 */
export function buildPatientContextPackage(storeState: {
  patient: PatientProfile;
  onboarding: OnboardingState;
  medications: Medication[];
  recoveryWeeks: RecoveryWeek[];
  symptomCheckIns: SymptomCheckIn[];
  setbacks: RecoverySetback[];
  visitSegments: VisitSegment[];
  documents: DocumentItem[];
  chatHistory: CorvasChatMessage[];
}): PatientContextPackage {
  const currentWeek = storeState.recoveryWeeks.find((w) => w.status === 'current') || storeState.recoveryWeeks[0];
  const recentCheckIns = storeState.symptomCheckIns.slice(-7); // last 7 days
  const recentSetbacks = storeState.setbacks.slice(0, 3); // most recent 3 setbacks

  return {
    patient: storeState.patient,
    onboarding: storeState.onboarding,
    medications: storeState.medications,
    currentWeek,
    recentCheckIns,
    recentSetbacks,
    visitSegments: storeState.visitSegments,
    documents: storeState.documents,
    conversationHistory: storeState.chatHistory.slice(-8), // last 8 messages (4 turns)
  };
}
