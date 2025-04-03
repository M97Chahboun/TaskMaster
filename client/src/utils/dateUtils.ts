export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return "Good morning";
  } else if (hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

export function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function getMonthName(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long' });
}

export function getFormattedDate(date: Date): string {
  const day = date.getDate();
  const month = getMonthName(date);
  
  return `${getDayName(date)}, ${month} ${day}`;
}

export function getTimeFromDate(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function getDaysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  
  // Set both dates to midnight for accurate day calculation
  firstDate.setHours(0, 0, 0, 0);
  secondDate.setHours(0, 0, 0, 0);
  
  return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay));
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

export function isTomorrow(date: Date): boolean {
  const tomorrow = addDays(new Date(), 1);
  return date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();
}

export function getRelativeDateString(date: Date): string {
  if (isToday(date)) {
    return 'Today';
  } else if (isTomorrow(date)) {
    return 'Tomorrow';
  } else {
    const now = new Date();
    const daysDiff = getDaysBetween(now, date);
    
    if (date < now) {
      if (daysDiff === 1) {
        return 'Yesterday';
      } else {
        return `${daysDiff} days ago`;
      }
    } else {
      if (daysDiff <= 7) {
        return `In ${daysDiff} days`;
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }
    }
  }
}
