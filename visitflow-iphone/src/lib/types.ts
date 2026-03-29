export type TabId = 'home' | 'visit' | 'meds' | 'rehab' | 'support';

export interface VisitLine {
  id: string;
  speaker: 'doctor' | 'patient' | 'ai';
  text: string;
  tag?: 'diagnosis' | 'medication' | 'instruction';
}

export interface MedicationItem {
  id: string;
  name: string;
  dose: string;
  time: string;
  status: 'due' | 'taken' | 'missed';
}

export interface RehabSession {
  day: string;
  status: 'done' | 'partial' | 'missed';
  steps: number;
  avgHR: number;
}
