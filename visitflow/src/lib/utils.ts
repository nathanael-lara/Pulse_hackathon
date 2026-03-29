import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function toICSDate(input: string) {
  return input.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
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
    'PRODID:-//VisitFlow AI//EN',
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
