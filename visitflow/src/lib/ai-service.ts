/**
 * AI Service Layer — VisitFlow
 * Abstracts OpenAI / Anthropic calls with graceful fallbacks for demo mode.
 */

import type { TranscriptLine, CardioStressResult, RiskLevel } from './types';

const ANTHROPIC_KEY = process.env.NEXT_PUBLIC_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY;
const OPENAI_KEY = process.env.NEXT_PUBLIC_OPENAI_KEY || process.env.OPENAI_API_KEY;

// ─── Simulated transcript lines for demo mode ────────────────────────────────

const DEMO_TRANSCRIPT_SEQUENCE = [
  { speaker: 'doctor' as const, text: "Good morning Maria, how have you been feeling this week?", delay: 1000 },
  { speaker: 'patient' as const, text: "A bit tired, but the morning walks have been helping.", delay: 3000 },
  { speaker: 'doctor' as const, text: "That's encouraging. Your EKG shows a mild arrhythmia — an irregular heart rhythm.", delay: 5000, tags: ['diagnosis', 'risk'] as const },
  { speaker: 'ai' as const, text: "Arrhythmia detected. This means your heart beats irregularly — like a drummer occasionally missing a beat.", delay: 6200 },
  { speaker: 'doctor' as const, text: "I'm starting you on metoprolol 25mg — take it every morning with food.", delay: 9000, tags: ['medication', 'instruction'] as const },
  { speaker: 'ai' as const, text: "New medication: Metoprolol (beta-blocker). Acts as a heart rate regulator.", delay: 10500 },
  { speaker: 'doctor' as const, text: "Keep your heart rate under 120 BPM during exercise. Stop if you feel any chest tightness.", delay: 14000, tags: ['instruction', 'risk'] as const },
  { speaker: 'ai' as const, text: "Safety limit set: HR < 120 BPM. Chest tightness = stop immediately.", delay: 15500 },
  { speaker: 'doctor' as const, text: "Come back in two weeks. We'll repeat the EKG and check how the medication is working.", delay: 19000, tags: ['followup'] as const },
  { speaker: 'ai' as const, text: "Follow-up: April 12. EKG repeat + medication review.", delay: 20500 },
];

// ─── Stream transcript (simulated + real) ────────────────────────────────────

export async function* streamTranscript(
  onLine: (line: Partial<TranscriptLine>) => void
): AsyncGenerator<Partial<TranscriptLine>> {
  let idCounter = 100;

  for (const item of DEMO_TRANSCRIPT_SEQUENCE) {
    await new Promise((r) => setTimeout(r, item.delay - (DEMO_TRANSCRIPT_SEQUENCE[0]?.delay ?? 0)));
    const line: Partial<TranscriptLine> = {
      id: `live-${idCounter++}`,
      timestamp: item.delay / 1000,
      speaker: item.speaker,
      text: item.text,
      tags: (item.tags ?? []) as TranscriptLine['tags'],
    };
    onLine(line);
    yield line;
  }
}

// ─── Translate doctor statement ───────────────────────────────────────────────

export async function translateDoctorStatement(text: string): Promise<string> {
  const prompt = `You are a medical translator helping a cardiac patient understand their doctor.
Translate this medical statement into simple, calm, reassuring language in 1-2 sentences:
"${text}"

Respond with ONLY the plain-language explanation. No preamble.`;

  return callAI(prompt, getFallbackExplanation(text));
}

// ─── Explain diagnosis ────────────────────────────────────────────────────────

export async function explainDiagnosis(diagnosis: string): Promise<string> {
  const prompt = `You are helping a cardiac patient understand their diagnosis.
Explain "${diagnosis}" in 2-3 simple sentences that are clear, accurate, and reassuring.
Use a calm, human tone. Avoid jargon. No preamble.`;

  return callAI(prompt, `${diagnosis} is a condition your cardiologist is monitoring and treating. Your doctor has a plan in place to help you manage this safely.`);
}

// ─── Answer visit question ────────────────────────────────────────────────────

export async function answerVisitQuestion(
  question: string,
  context: string
): Promise<string> {
  const prompt = `You are a helpful medical AI assistant. A patient is asking a question about their recent cardiology visit.

Visit context:
${context}

Patient's question: "${question}"

Answer clearly and helpfully in 2-3 sentences. If the question requires a doctor's judgment, say so. No preamble.`;

  return callAI(prompt, "That's a great question to discuss with your care team. Based on your visit notes, your doctor will address this at your follow-up appointment.");
}

// ─── Detect risk state ────────────────────────────────────────────────────────

export function detectRiskState(params: {
  heartRate: number;
  symptoms: string[];
  transcriptFlags: string[];
  rehabCompliance: number; // 0-1
}): RiskLevel {
  const { heartRate, symptoms, transcriptFlags, rehabCompliance } = params;

  const criticalSymptoms = ['chest pain', 'chest tightness', 'severe shortness of breath', 'fainting'];
  const hasCritical = symptoms.some((s) =>
    criticalSymptoms.some((c) => s.toLowerCase().includes(c))
  );

  if (hasCritical || heartRate > 140 || transcriptFlags.includes('risk')) return 'red';
  if (heartRate > 120 || symptoms.length > 2 || rehabCompliance < 0.3) return 'yellow';
  if (heartRate > 110 || rehabCompliance < 0.6) return 'yellow';
  return 'green';
}

// ─── Evaluate cardio stress ───────────────────────────────────────────────────

export function evaluateCardioStress(params: {
  currentHR: number;
  restingHR: number;
  maxHR: number;
  activity: string;
  hrVariability: number;
}): CardioStressResult {
  const { currentHR, restingHR, maxHR, activity } = params;
  const targetHR = restingHR + (maxHR - restingHR) * 0.5; // 50% HRR — Karvonen
  const upperLimit = restingHR + (maxHR - restingHR) * 0.6;
  const diff = currentHR - targetHR;

  if (currentHR > maxHR * 0.85 || currentHR > 130) {
    return {
      status: 'critical',
      currentHR,
      expectedHR: Math.round(targetHR),
      hrVariability: params.hrVariability,
      recommendation: "Stop your activity now and rest. Your heart rate is too high. Sit down, breathe slowly, and call your care team if it doesn't come down within 5 minutes.",
      shouldStop: true,
    };
  }

  if (currentHR > upperLimit) {
    return {
      status: 'high',
      currentHR,
      expectedHR: Math.round(targetHR),
      hrVariability: params.hrVariability,
      recommendation: "Your heart rate is higher than expected — slow your pace. Take it easy for the next few minutes.",
      shouldStop: false,
    };
  }

  if (diff > 5) {
    return {
      status: 'elevated',
      currentHR,
      expectedHR: Math.round(targetHR),
      hrVariability: params.hrVariability,
      recommendation: "Slightly elevated — keep going but maintain this pace. You're doing well.",
      shouldStop: false,
    };
  }

  return {
    status: 'optimal',
    currentHR,
    expectedHR: Math.round(targetHR),
    hrVariability: params.hrVariability,
    recommendation: "Perfect pace. Your heart is responding exactly as expected. Keep it up.",
    shouldStop: false,
  };
}

// ─── Generate rehab plan ──────────────────────────────────────────────────────

export async function generateRehabPlan(week: number, compliance: number): Promise<string> {
  const prompt = `You are a cardiac rehabilitation AI. Generate a brief (3-4 sentences) personalized plan for Week ${week} of cardiac rehab. The patient's compliance last week was ${Math.round(compliance * 100)}%. Be specific, encouraging, and medically appropriate.`;
  return callAI(prompt, `Week ${week} plan: Continue building on your progress with daily walks and breathing exercises. Focus on consistency over intensity — your heart is still adapting. Aim for 20-30 minutes of gentle walking each day, keeping your heart rate in your safe zone.`);
}

// ─── Generate encouragement ───────────────────────────────────────────────────

export function generateEncouragement(scenario: 'win' | 'wall' | 'streak' | 'milestone', details?: string): string {
  const messages = {
    win: [
      "Great work — that walk just made your heart stronger. Every step counts.",
      "You completed your task. Your heart notices every effort you make.",
      "This is exactly what recovery looks like. Well done.",
    ],
    wall: [
      "I noticed you skipped today — that's okay. Want to try a shorter 10-minute walk instead?",
      "Rest is part of recovery too. How are you feeling? Would a gentle breathing session help?",
      "Missing a day doesn't erase your progress. Tomorrow is a fresh start.",
    ],
    streak: [
      `${details} days in a row. Your consistency is building a stronger heart.`,
      `${details}-day streak — this kind of habit is what real recovery is built on.`,
    ],
    milestone: [
      `${details} — a real milestone. This would have felt impossible weeks ago.`,
      `You reached ${details}. Your cardiologist will be proud of this.`,
    ],
  };

  const pool = messages[scenario];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Detect escalation ────────────────────────────────────────────────────────

export function detectEscalation(params: {
  symptoms: string[];
  heartRate: number;
  alertHistory: number;
}): { level: 'none' | 'yellow' | 'orange' | 'red'; message: string } {
  const { symptoms, heartRate, alertHistory } = params;

  const redSymptoms = ['chest pain', 'chest tightness', 'fainting', 'severe breathlessness'];
  const hasRed = symptoms.some((s) => redSymptoms.some((r) => s.toLowerCase().includes(r)));

  if (hasRed || heartRate > 140) {
    return {
      level: 'red',
      message: `Maria reported chest discomfort and elevated HR (${heartRate} BPM). Please check on her.`,
    };
  }

  if (heartRate > 120 || alertHistory >= 3) {
    return {
      level: 'orange',
      message: `Maria's heart rate has been elevated today. Consider checking in with her.`,
    };
  }

  if (symptoms.length > 0) {
    return {
      level: 'yellow',
      message: `Maria reported symptoms. Monitoring — no action needed yet.`,
    };
  }

  return { level: 'none', message: '' };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function callAI(prompt: string, fallback: string): Promise<string> {
  // Try Anthropic first
  if (ANTHROPIC_KEY) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 256,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.content?.[0]?.text?.trim() ?? fallback;
      }
    } catch {
      // fall through
    }
  }

  // Try OpenAI
  if (OPENAI_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 256,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() ?? fallback;
      }
    } catch {
      // fall through
    }
  }

  return fallback;
}

function getFallbackExplanation(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('arrhythmia') || lower.includes('irregular')) {
    return "Your heart rhythm is slightly irregular. This is common after a cardiac event and your doctor is treating it with medication.";
  }
  if (lower.includes('metoprolol') || lower.includes('beta')) {
    return "This medication helps regulate your heart rate by slowing the electrical signals in your heart — like a speed governor.";
  }
  if (lower.includes('ekg') || lower.includes('ecg')) {
    return "An EKG is a painless test that records the electrical activity of your heart to check its rhythm and health.";
  }
  if (lower.includes('heart rate')) {
    return "Your heart rate shows how many times your heart beats per minute. Keeping it in a safe range protects your healing heart.";
  }
  return "Your doctor is explaining an important part of your care. Tap to see more detail or ask a follow-up question.";
}
