export type DateFormat = 'short' | 'long' | 'time' | 'month-year' | 'full-date';

const LOCALE = 'en-US';

const formatOptions: Record<DateFormat, Intl.DateTimeFormatOptions> = {
  short: { year: 'numeric', month: 'numeric', day: 'numeric' },
  long: { year: 'numeric', month: 'long', day: 'numeric' },
  time: { hour: 'numeric', minute: 'numeric' },
  'month-year': { month: 'short', year: 'numeric' },
  'full-date': { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
};

const formatters: Record<DateFormat, Intl.DateTimeFormat> = {
  short: new Intl.DateTimeFormat(LOCALE, formatOptions.short),
  long: new Intl.DateTimeFormat(LOCALE, formatOptions.long),
  time: new Intl.DateTimeFormat(LOCALE, formatOptions.time),
  'month-year': new Intl.DateTimeFormat(LOCALE, formatOptions['month-year']),
  'full-date': new Intl.DateTimeFormat(LOCALE, formatOptions['full-date']),
};

export function formatDate(date: string | Date, format: DateFormat = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const formatter = formatters[format];
  return formatter.format(dateObj);
}

export function formatDateShort(date: string | Date): string {
  return formatDate(date, 'short');
}

export function formatDateLong(date: string | Date): string {
  return formatDate(date, 'long');
}

const timeFormatter = new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: 'numeric' });

export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time';
  }

  return timeFormatter.format(dateObj);
}

export function formatDistanceToNow(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (isNaN(diffInSeconds)) {
    return 'Invalid Date';
  }

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  if (diffInSeconds < minute) {
    return 'just now';
  } else if (diffInSeconds < hour) {
    const minutes = Math.floor(diffInSeconds / minute);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < day) {
    const hours = Math.floor(diffInSeconds / hour);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < week) {
    const days = Math.floor(diffInSeconds / day);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < month) {
    const weeks = Math.floor(diffInSeconds / week);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < year) {
    const months = Math.floor(diffInSeconds / month);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / year);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}
