export interface TimeZone {
  id: string;
  name: string;
  utcOffset: number;
}

export const TIME_ZONES: TimeZone[] = [
  { id: 'Pacific/Honolulu', name: 'Hawaii Time (UTC -10)', utcOffset: -10 },
  { id: 'America/Anchorage', name: 'Alaska Time (UTC -9)', utcOffset: -9 },
  { id: 'America/Los_Angeles', name: 'Pacific Time (UTC -8)', utcOffset: -8 },
  { id: 'America/Denver', name: 'Mountain Time (UTC -7)', utcOffset: -7 },
  { id: 'America/Chicago', name: 'Central Time (UTC -6)', utcOffset: -6 },
  { id: 'America/New_York', name: 'Eastern Time (UTC -5)', utcOffset: -5 },
  { id: 'America/Halifax', name: 'Atlantic Time (UTC -4)', utcOffset: -4 },
  { id: 'America/St_Johns', name: 'Newfoundland Time (UTC -3:30)', utcOffset: -3.5 },
  { id: 'America/Sao_Paulo', name: 'Brasilia Time (UTC -3)', utcOffset: -3 },
  { id: 'Atlantic/Azores', name: 'Azores Time (UTC -1)', utcOffset: -1 },
  { id: 'UTC', name: 'Coordinated Universal Time (UTC)', utcOffset: 0 },
  { id: 'Europe/London', name: 'London Time (UTC +0)', utcOffset: 0 },
  { id: 'Europe/Paris', name: 'Central European Time (UTC +1)', utcOffset: 1 },
  { id: 'Europe/Athens', name: 'Eastern European Time (UTC +2)', utcOffset: 2 },
  { id: 'Europe/Moscow', name: 'Moscow Time (UTC +3)', utcOffset: 3 },
  { id: 'Asia/Dubai', name: 'Gulf Time (UTC +4)', utcOffset: 4 },
  { id: 'Asia/Karachi', name: 'Pakistan Time (UTC +5)', utcOffset: 5 },
  { id: 'Asia/Kolkata', name: 'India Time (UTC +5:30)', utcOffset: 5.5 },
  { id: 'Asia/Dhaka', name: 'Bangladesh Time (UTC +6)', utcOffset: 6 },
  { id: 'Asia/Bangkok', name: 'Indochina Time (UTC +7)', utcOffset: 7 },
  { id: 'Asia/Shanghai', name: 'China Time (UTC +8)', utcOffset: 8 },
  { id: 'Asia/Tokyo', name: 'Japan Time (UTC +9)', utcOffset: 9 },
  { id: 'Australia/Sydney', name: 'Australian Eastern Time (UTC +10)', utcOffset: 10 },
  { id: 'Pacific/Auckland', name: 'New Zealand Time (UTC +12)', utcOffset: 12 },
];

export function formatDateInTimeZone(timestamp: bigint, timeZone: TimeZone): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: timeZone.id,
  });
}

export function formatTimeInTimeZone(timestamp: bigint, timeZone: TimeZone): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timeZone.id,
  });
}

export function formatDateTimeInTimeZone(timestamp: bigint, timeZone: TimeZone): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timeZone.id,
  });
}

export function getDateInTimeZone(timestamp: bigint, timeZone: TimeZone): Date {
  const date = new Date(Number(timestamp) / 1_000_000);
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timeZone.id }));
  const offset = tzDate.getTime() - utcDate.getTime();
  return new Date(date.getTime() + offset);
}

export function getMonthDaysInTimeZone(year: number, month: number, timeZone: TimeZone): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  
  return days;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
