/**
 * Background task scheduler for passive app experience
 * User gets reminded & can take action WITHOUT opening app
 */

export interface ScheduledReminder {
  id: string;
  type: 'medication' | 'checkin' | 'workout' | 'motivation';
  title: string;
  body: string;
  scheduledTime: string; // ISO string
  medicationId?: string;
  data: Record<string, string>;
}

// Smart reminder timing - when patients are most likely to engage
export function getOptimalReminderTime(
  reminderType: 'medication' | 'checkin' | 'workout' | 'motivation'
): { hour: number; minute: number } {
  // Medication: 30min before dose time (breakfast 7:30, lunch 12:30, dinner 6:30)
  // Check-in: 8 PM (evening reflection)
  // Workout: 9 AM (morning, best recovery time)
  // Motivation: 7 AM (start day strong)

  const times: Record<string, { hour: number; minute: number }> = {
    medication: { hour: 7, minute: 30 }, // Morning meds
    checkin: { hour: 20, minute: 0 }, // Evening
    workout: { hour: 9, minute: 0 }, // Morning
    motivation: { hour: 7, minute: 0 }, // Start of day
  };

  return times[reminderType] || { hour: 10, minute: 0 };
}

// Generate reminders for the day
export function generateDailyReminders(params: {
  patientName: string;
  medicationNames: string[];
  hasWorkoutToday: boolean;
  lastCheckInDaysAgo: number;
}): ScheduledReminder[] {
  const today = new Date();
  const reminders: ScheduledReminder[] = [];

  // Morning medication reminder
  if (params.medicationNames.length > 0) {
    const medTime = getOptimalReminderTime('medication');
    const scheduledTime = new Date(today);
    scheduledTime.setHours(medTime.hour, medTime.minute, 0);

    reminders.push({
      id: `med-reminder-${today.toDateString()}`,
      type: 'medication',
      title: 'Time for your medications',
      body: `Take ${params.medicationNames[0]}${params.medicationNames.length > 1 ? ' and others' : ''} with breakfast.`,
      scheduledTime: scheduledTime.toISOString(),
      data: {
        action: 'medication',
        label: 'I took them',
      },
    });
  }

  // Morning workout reminder
  if (params.hasWorkoutToday) {
    const workTime = getOptimalReminderTime('workout');
    const scheduledTime = new Date(today);
    scheduledTime.setHours(workTime.hour, workTime.minute, 0);

    reminders.push({
      id: `workout-reminder-${today.toDateString()}`,
      type: 'workout',
      title: 'Gentle movement time',
      body: 'A 20-minute walk helps your heart. When you are ready, go outside.',
      scheduledTime: scheduledTime.toISOString(),
      data: {
        action: 'workout',
        label: 'I walked',
      },
    });
  }

  // Evening check-in reminder (if hasn't checked in today)
  if (params.lastCheckInDaysAgo > 0) {
    const checkTime = getOptimalReminderTime('checkin');
    const scheduledTime = new Date(today);
    scheduledTime.setHours(checkTime.hour, checkTime.minute, 0);

    reminders.push({
      id: `checkin-reminder-${today.toDateString()}`,
      type: 'checkin',
      title: 'How are you feeling?',
      body: 'A quick check-in helps your care team. Takes 1 minute.',
      scheduledTime: scheduledTime.toISOString(),
      data: {
        action: 'checkin',
        label: 'Log how I feel',
      },
    });
  }

  // Morning motivation
  const motivTime = getOptimalReminderTime('motivation');
  const motivScheduled = new Date(today);
  motivScheduled.setHours(motivTime.hour, motivTime.minute, 0);

  const motivations = [
    `Good morning, ${params.patientName}. Your heart is healing. Today is a fresh start.`,
    `${params.patientName}, one step at a time. You're doing better than you think.`,
    `Your recovery matters. Small things today = big progress this week.`,
    `You've made it through every hard day so far. Today will be okay too.`,
    `Take care of yourself today like you'd care for someone you love.`,
  ];

  reminders.push({
    id: `motivation-${today.toDateString()}`,
    type: 'motivation',
    title: '💛 Good morning',
    body: motivations[Math.floor(Math.random() * motivations.length)],
    scheduledTime: motivScheduled.toISOString(),
    data: {
      action: 'motivation',
    },
  });

  return reminders;
}

// Background reminder state - track what's been sent today
export function getLastSentReminder(type: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(`reminder-sent-${type}-${new Date().toDateString()}`);
}

export function markReminderSent(type: string) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(`reminder-sent-${type}-${new Date().toDateString()}`, 'true');
  }
}

// Check if it's time to send a reminder
export function shouldSendReminder(reminder: ScheduledReminder): boolean {
  const now = new Date();
  const reminderTime = new Date(reminder.scheduledTime);

  // Send if within 5 minutes of scheduled time
  const diffMs = now.getTime() - reminderTime.getTime();
  return diffMs >= 0 && diffMs < 5 * 60 * 1000;
}

// Get reminders that should be sent today
export function getTodaysReminders(reminders: ScheduledReminder[]): ScheduledReminder[] {
  const today = new Date().toDateString();
  return reminders.filter((r) => new Date(r.scheduledTime).toDateString() === today);
}
