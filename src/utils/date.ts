export type DateFormat = 'short' | 'long' | 'time' | 'month-year' | 'full-date';

export function formatDate(date: string | Date, format: DateFormat = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const options: Intl.DateTimeFormatOptions = {};

  switch (format) {
    case 'short':
      options.year = 'numeric';
      options.month = 'numeric';
      options.day = 'numeric';
      break;
    case 'long':
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      break;
    case 'time':
      options.hour = 'numeric';
      options.minute = 'numeric';
      break;
    case 'month-year':
      options.month = 'short';
      options.year = 'numeric';
      break;
    case 'full-date':
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      options.weekday = 'long';
      break;
    default:
      options.year = 'numeric';
      options.month = 'numeric';
      options.day = 'numeric';
  }

  return dateObj.toLocaleDateString('en-US', options);
}

export function formatDateShort(date: string | Date): string {
  return formatDate(date, 'short');
}

export function formatDateLong(date: string | Date): string {
  return formatDate(date, 'long');
}

export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time';
  }

  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric'
  });
}
