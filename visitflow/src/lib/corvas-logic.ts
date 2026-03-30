import type {
  CommunitySupportMember,
  CorvasChatMessage,
  DocumentItem,
  EscalationEvent,
  Medication,
  ProviderMatch,
  RecoverySetback,
  RecoveryWeek,
  RiskTier,
  SymptomCheckIn,
  TransportOption,
  VisitSegment,
} from '@/lib/types';

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function formatLongDate(input: string) {
  return new Date(input).toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(input: string) {
  return new Date(input).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getTodayDoses(medications: Medication[]) {
  const now = new Date();
  return medications.flatMap((medication) =>
    medication.doses
      .filter((dose) => isSameDay(new Date(dose.scheduledAt), now))
      .map((dose) => ({ ...dose, medication }))
  );
}

export function getMedicationSummary(medications: Medication[]) {
  const doses = getTodayDoses(medications);
  const taken = doses.filter((dose) => dose.status === 'taken').length;
  const due = doses.filter((dose) => dose.status === 'due' || dose.status === 'snoozed').length;
  const skipped = doses.filter((dose) => dose.status === 'skipped').length;
  const adherenceBase = medications.flatMap((medication) => medication.doses).filter((dose) => new Date(dose.scheduledAt) <= new Date());
  const adherence = adherenceBase.length
    ? Math.round((adherenceBase.filter((dose) => dose.status === 'taken').length / adherenceBase.length) * 100)
    : 100;

  return { doses, taken, due, skipped, adherence };
}

export function getRecoverySummary(weeks: RecoveryWeek[]) {
  const currentWeek = weeks.find((week) => week.status === 'current') ?? weeks[0];
  const completed = currentWeek.sessions.filter((session) => session.status === 'completed').length;
  const total = currentWeek.sessions.length;
  const missed = currentWeek.sessions.filter((session) => session.status === 'missed').length;
  const todaySession = currentWeek.sessions.find((session) => session.status === 'today');
  const progress = total ? Math.round((completed / total) * 100) : 0;

  return { currentWeek, completed, total, missed, todaySession, progress };
}

export function getTodaysCheckIn(checkIns: SymptomCheckIn[]) {
  const now = new Date();
  return checkIns.find((entry) => isSameDay(new Date(entry.createdAt), now)) ?? null;
}

// Smart pattern detection - only escalate if patterns emerge, not one-off skips
export function detectPatterns(params: {
  medications: Medication[];
  checkIns: SymptomCheckIn[];
  setbacks: RecoverySetback[];
}): {
  hasSkipPattern: boolean; // 2+ skips in last 3 days
  hasSymptomPattern: boolean; // high symptoms persisting 2+ days
  hasEngagementDropPattern: boolean; // no check-ins for 2+ days
  needsEncouragement: boolean; // gentle nudge before escalation
} {
  const now = Date.now();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

  // Check for medication skip pattern (2+ skips in last 3 days = pattern, not isolated)
  const recentSkips = params.medications.flatMap((m) =>
    m.doses.filter(
      (dose) => dose.status === 'skipped' && now - new Date(dose.scheduledAt).getTime() < threeDaysMs
    )
  );
  const hasSkipPattern = recentSkips.length >= 2;

  // Check for symptom pattern (high worry/breathlessness on 2+ check-ins in last 3 days)
  const recentCheckIns = params.checkIns.filter(
    (ci) => now - new Date(ci.createdAt).getTime() < threeDaysMs
  );
  const highSymptomCheckIns = recentCheckIns.filter(
    (ci) => (ci.worry >= 3 && ci.worry >= ci.fatigue) || ci.breathlessness >= 3
  );
  const hasSymptomPattern = highSymptomCheckIns.length >= 2;

  // Check for engagement drop (no check-ins for 2+ days = patient withdrawing)
  const latestCheckIn = recentCheckIns[0];
  const daysSinceCheckIn = latestCheckIn ? (now - new Date(latestCheckIn.createdAt).getTime()) / (24 * 60 * 60 * 1000) : 3;
  const hasEngagementDropPattern = daysSinceCheckIn >= 2;

  // Gentle nudge needed if showing early warning signs but not yet a pattern
  const needsEncouragement =
    (recentSkips.length === 1 && !hasSkipPattern) ||
    (highSymptomCheckIns.length === 1 && !hasSymptomPattern) ||
    daysSinceCheckIn >= 1.5;

  return {
    hasSkipPattern,
    hasSymptomPattern,
    hasEngagementDropPattern,
    needsEncouragement,
  };
}

export function evaluateRisk(params: {
  medications: Medication[];
  weeks: RecoveryWeek[];
  checkIns: SymptomCheckIn[];
  setbacks: RecoverySetback[];
}): {
  tier: RiskTier;
  reasons: string[];
} {
  const { medications, weeks, checkIns, setbacks } = params;
  const medicationSummary = getMedicationSummary(medications);
  const recoverySummary = getRecoverySummary(weeks);
  const latestCheckIn = [...checkIns].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
  const patterns = detectPatterns({ medications, checkIns, setbacks });
  const reasons: string[] = [];

  if (latestCheckIn?.chestDiscomfort >= 3) {
    return {
      tier: 'urgent',
      reasons: ['Chest discomfort is showing up at a concerning level.'],
    };
  }

  if ((latestCheckIn?.breathlessness ?? 0) >= 4 || (latestCheckIn?.dizziness ?? 0) >= 4) {
    return {
      tier: 'urgent',
      reasons: ['Breathing or dizziness symptoms are high today.'],
    };
  }

  // Only escalate if patterns exist, not isolated skips
  if (patterns.hasSkipPattern) {
    reasons.push('Medication doses have been skipped multiple times this week.');
  }

  if (recoverySummary.missed >= 2) {
    reasons.push('Recovery sessions are slipping this week.');
  }

  if (patterns.hasSymptomPattern) {
    reasons.push('Symptoms like worry or breathlessness are building over days.');
  }

  if (patterns.hasEngagementDropPattern) {
    reasons.push("You haven't done a check-in for a couple of days — reach out if things feel hard.");
  }

  if (setbacks[0] && Date.now() - new Date(setbacks[0].createdAt).getTime() < 1000 * 60 * 60 * 36) {
    reasons.push('A recent setback was logged in the last day and a half.');
  }

  if (reasons.length >= 2) {
    return { tier: 'support', reasons };
  }

  if (reasons.length === 1) {
    return { tier: 'watch', reasons };
  }

  return { tier: 'steady', reasons: ['Recovery looks steady right now.'] };
}

// Motivational nudges - gentle encouragement before escalation needed
export function getMotivationalMessage(params: {
  checkIns: SymptomCheckIn[];
  medications: Medication[];
  weekNumber: number;
}): string {
  const patterns = detectPatterns({ medications: params.medications, checkIns: params.checkIns, setbacks: [] });

  if (!patterns.needsEncouragement) {
    return '';
  }

  const messages = [
    "Recovery isn't linear. Some days are harder. You're still moving forward.",
    "That skipped dose happens. Get back on track with the next one — you've got this.",
    "Worry is normal after a heart event. Logging how you feel helps your care team support you.",
    "Take a breath. Even small steps today count. You don't have to be perfect.",
    "Missing a check-in is okay. How are you feeling right now? We're here to listen.",
    "This week might feel tougher, but you've already proven you can do this recovery.",
    "One missed workout doesn't erase your progress. Tomorrow is a fresh start.",
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

export function buildEscalations(params: {
  medications: Medication[];
  weeks: RecoveryWeek[];
  checkIns: SymptomCheckIn[];
  setbacks: RecoverySetback[];
}): EscalationEvent[] {
  const assessment = evaluateRisk(params);

  if (assessment.tier === 'steady') {
    return [];
  }

  if (assessment.tier === 'watch') {
    return [
      {
        id: 'escalation-watch',
        tier: 'watch',
        createdAt: new Date().toISOString(),
        title: 'Gentle check-in suggested',
        message: assessment.reasons[0] ?? 'Something looks slightly off today.',
        actionLabel: 'Review today’s plan',
      },
    ];
  }

  if (assessment.tier === 'support') {
    return [
      {
        id: 'escalation-support',
        tier: 'support',
        createdAt: new Date().toISOString(),
        title: 'Care-circle support is a good idea',
        message: assessment.reasons.join(' '),
        actionLabel: 'Share an update',
      },
    ];
  }

  return [
    {
      id: 'escalation-urgent',
      tier: 'urgent',
      createdAt: new Date().toISOString(),
      title: 'Emergency help may be needed',
      message: assessment.reasons.join(' '),
      actionLabel: 'Open urgent options',
    },
  ];
}

export function simplifyDocument(title: string, rawText: string) {
  const cleaned = rawText.replace(/\s+/g, ' ').trim();
  const snippet = cleaned.slice(0, 220);

  return {
    plainSummary: cleaned
      ? `This ${title.toLowerCase()} says: ${snippet}${cleaned.length > 220 ? '...' : ''}`
      : 'This file was added, but the text could not be read yet. You can still keep it here for your next visit.',
    followUpQuestions: [
      'What should I pay attention to first in this document?',
      'Does anything here change what I do this week?',
    ],
  };
}

export function generateVoiceFollowups(text: string) {
  const lower = text.toLowerCase();

  if (lower.includes('breath') || lower.includes('winded')) {
    return [
      'Should I message my care team about this breathing change?',
      'What symptoms mean I should stop activity right away?',
      'Would a closer rehab option or ride help this week?',
    ];
  }

  if (lower.includes('medicine') || lower.includes('dose') || lower.includes('pill')) {
    return [
      'What should I do if I miss this dose?',
      'What side effects should I watch for?',
      'Can you help me message my doctor about this medication?',
    ];
  }

  if (lower.includes('doctor') || lower.includes('visit') || lower.includes('mean')) {
    return [
      'Can you explain that in simpler words?',
      'What should I ask at my next visit?',
      'Should I call or video chat with my doctor about this now?',
    ];
  }

  if (lower.includes('ride') || lower.includes('far') || lower.includes('transport')) {
    return [
      'Show me ride options near me.',
      'Can you find a closer doctor or rehab site?',
      'Who in the support community can take me to an appointment?',
    ];
  }

  return [
    'What should I do next?',
    'Should I contact someone?',
    'Can you turn that into a message for my doctor?',
  ];
}

export function getTransportRecommendations(options: TransportOption[], distanceMiles: number) {
  const sorted = options
    .filter((option) => option.maxDistanceMiles >= distanceMiles || option.type === 'telehealth-fallback')
    .sort((a, b) => a.maxDistanceMiles - b.maxDistanceMiles);

  return sorted.slice(0, 3);
}

export function getProviderRecommendations(matches: ProviderMatch[], distanceMiles: number) {
  const sorted = [...matches].sort((a, b) => {
    const aScore = a.offersVideo ? a.distanceMiles - 1 : a.distanceMiles;
    const bScore = b.offersVideo ? b.distanceMiles - 1 : b.distanceMiles;
    return aScore - bScore;
  });

  if (distanceMiles > 20) {
    return sorted.filter((match) => match.offersVideo).slice(0, 2);
  }

  return sorted.slice(0, 3);
}

export function getCommunityMatches(members: CommunitySupportMember[], distanceMiles: number) {
  return members
    .filter((member) => member.distanceMiles <= Math.max(distanceMiles / 2, 10) || member.canDrive)
    .slice(0, 3);
}

export function findVisitSegment(segments: VisitSegment[], query: string) {
  const lowerQuery = query.toLowerCase();
  return segments.find((segment) =>
    segment.title.toLowerCase().includes(lowerQuery)
    || segment.clinicalText.toLowerCase().includes(lowerQuery)
    || segment.tags.some((tag) => lowerQuery.includes(tag))
  );
}

export function routeCorvasQuestion(params: {
  text: string;
  medications: Medication[];
  weeks: RecoveryWeek[];
  checkIns: SymptomCheckIn[];
  segments: VisitSegment[];
  documents: DocumentItem[];
}): string {
  const text = params.text.toLowerCase();
  const medicationSummary = getMedicationSummary(params.medications);
  const recoverySummary = getRecoverySummary(params.weeks);
  const latestCheckIn = [...params.checkIns].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
  const matchingVisitSegment = findVisitSegment(params.segments, text);
  const matchingDocument = params.documents.find((document) =>
    text.includes('document')
    || text.includes(document.title.toLowerCase())
    || text.includes(document.source)
  );

  if (text.includes("doctor mean") || text.includes("explain") || text.includes("arrhythmia") || text.includes("cardiac test")) {
    return matchingVisitSegment?.simpleText
      ?? "Your doctor noted a mild arrhythmia during your EKG. That means your heart rhythm is slightly irregular, but it is benign. They want to monitor it during recovery by increasing your Metoprolol dose. This is protective, not a sign of danger.";
  }

  if (text.includes("medicine") || text.includes("medication") || text.includes("did i take")) {
    const medNames = params.medications.map((m) => m.name).join(", ");
    if (medicationSummary.due > 0) {
      return `You are taking ${medNames}. You still have ${medicationSummary.due} dose${medicationSummary.due > 1 ? "s" : ""} to confirm today. The next one due is ${medicationSummary.doses.find((dose) => dose.status !== "taken")?.medication.name ?? "your scheduled dose"}. This is important for your heart rhythm stability.`;
    }
    return `Your medications are on track: ${medNames}. Your adherence is ${medicationSummary.adherence}%, which is excellent. Keep it up—these medications are protecting your heart during recovery.`;
  }

  if (text.includes("food") || text.includes("eat") || text.includes("sodium")) {
    return "Your target is under 1500 milligrams of sodium daily. Focus on fresh fruits, vegetables, lean proteins like salmon, and whole grains. Avoid processed foods, canned soups, and salty snacks. Mediterranean diet is ideal for cardiac recovery. I can help you log meals to track your sodium intake.";
  }

  if (text.includes("exercise") || text.includes("walking") || text.includes("workout") || text.includes("should i be exercising")) {
    return `You are in week ${recoverySummary.currentWeek.week} of recovery. Walking 20 to 30 minutes most days at a pace where you can still talk is perfect. If you feel chest pain, dizziness, or shortness of breath that does not go away with rest, stop immediately. Your activity level should feel sustainable, not stressful.`;
  }

  if (text.includes("tomorrow") || text.includes("what should i do next")) {
    return recoverySummary.todaySession
      ? `Your next rehab session is ${recoverySummary.todaySession.title}. Plan for about ${recoverySummary.todaySession.durationMinutes} minutes. Keep it at a pace where you can still talk comfortably. You have completed ${recoverySummary.completed} of ${recoverySummary.total} sessions this week.`
      : `Tomorrow: take your morning medications, do a check-in if your symptoms change, and keep any activity gentle and steady. You are in week ${recoverySummary.currentWeek.week} of your 12-week recovery program.`;
  }

  if (text.includes("short of breath") || text.includes("worried") || text.includes("feel worried")) {
    if ((latestCheckIn?.breathlessness ?? 0) >= 3) {
      return "I see you logged breathlessness recently. This is important. Slow down your activity, rest, and contact your care team today. Shortness of breath that worsens needs medical attention. Do not push through it.";
    }
    return "Worry and anxiety are common after a heart event. Logging your feelings in a check-in helps your care team understand what you need. Take slow breaths, rest, and consider reaching out to family or your care team for support.";
  }

  if (text.includes("rehab") || text.includes("progress") || text.includes("walk") || text.includes("work")) {
    return `You are in week ${recoverySummary.currentWeek.week} of 12. ${recoverySummary.completed} of ${recoverySummary.total} sessions are complete this week. Your focus is ${recoverySummary.currentWeek.focus.toLowerCase()}. ${recoverySummary.missed > 0 ? `You missed ${recoverySummary.missed} session${recoverySummary.missed > 1 ? "s" : ""} this week—let’s get back on track.` : "You are on track. Keep it up."}`;
  }

  if (text.includes("message") || text.includes("call my daughter") || text.includes("ask for help") || text.includes("share update")) {
    return "I can help you share a calm update with your family or care team. Go to the Support tab and I will help you compose a message with one tap. Your family wants to support you—let them know how you are doing.";
  }

  if (text.includes('ride') || text.includes('transport') || text.includes('far away') || text.includes('appointment') || text.includes('logistics')) {
    return 'Travel burden matters. Open the Support tab and I will show ride options, nearby volunteers, closer provider matches, and video-visit fallbacks so distance does not become the reason care slips.';
  }

  if (text.includes("document") || text.includes("summary") || text.includes("paperwork") || text.includes("test") || text.includes("lab")) {
    return matchingDocument?.plainSummary ?? "You can save documents from your visits here. Upload any paperwork, test results, or notes, and I will rewrite it in simpler language so you understand what it means.";
  }

  return 'I can help with today’s medications, your recovery plan, symptoms, visit notes, or a message to someone you trust. Tell me what feels most important right now.';
}

export function makeAssistantMessage(text: string, mode: 'voice' | 'text'): CorvasChatMessage {
  return {
    id: `assistant-${Date.now()}`,
    role: 'assistant',
    text,
    createdAt: new Date().toISOString(),
    mode,
  };
}

export function makeUserMessage(text: string, mode: 'voice' | 'text'): CorvasChatMessage {
  return {
    id: `user-${Date.now()}`,
    role: 'user',
    text,
    createdAt: new Date().toISOString(),
    mode,
  };
}
