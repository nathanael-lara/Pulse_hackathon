import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { HRZone } from '@/lib/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function toICSDate(input: string) {
  return input.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function downloadCalendarEvent(params: {
  title: string;
  description: string;
  start: string;
  end: string;
  location?: string;
}) {
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CorVas AI//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@visitflow.ai`,
    `DTSTAMP:${toICSDate(new Date().toISOString())}`,
    `DTSTART:${toICSDate(params.start)}`,
    `DTEND:${toICSDate(params.end)}`,
    `SUMMARY:${params.title}`,
    `DESCRIPTION:${params.description}`,
    params.location ? `LOCATION:${params.location}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\n');

  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${params.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}

// Calculate HR zone based on average heart rate and max HR estimate
export function calculateHRZone(avgHeartRate: number, maxHREstimate: number): HRZone {
  const percentageMax = (avgHeartRate / maxHREstimate) * 100;
  if (percentageMax < 60) return 'zone1';
  if (percentageMax < 70) return 'zone2';
  if (percentageMax < 80) return 'zone3';
  return 'zone4';
}

// Calculate max HR estimate using 220 - age formula
export function calculateMaxHR(age: number): number {
  return 220 - age;
}

// Check if HR exceeded safe threshold for patient (Maria's limit: 120 BPM)
export function checkSafeHRThreshold(avgHeartRate: number, safeThresholdBPM = 120): boolean {
  return avgHeartRate > safeThresholdBPM;
}
