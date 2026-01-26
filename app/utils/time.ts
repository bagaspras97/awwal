import { SimplePrayerTime } from '@/app/types/prayer';

/**
 * Get current time in minutes from midnight
 */
export function getCurrentTimeInMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Convert time string (HH:MM) to minutes from midnight
 */
export function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Calculate minutes until next prayer
 */
export function getMinutesUntilPrayer(prayerTime: string): number {
  const currentMinutes = getCurrentTimeInMinutes();
  const prayerMinutes = timeStringToMinutes(prayerTime);
  
  let diff = prayerMinutes - currentMinutes;
  
  // If prayer time has passed today, it's tomorrow
  if (diff < 0) {
    diff += 24 * 60; // Add 24 hours
  }
  
  return diff;
}

/**
 * Format minutes to human readable time
 */
export function formatMinutesToTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} menit`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} jam`;
  }
  
  return `${hours} jam ${remainingMinutes} menit`;
}

/**
 * Get greeting based on current time
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 5) return 'Selamat malam';
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

/**
 * Get next prayer from prayer times array
 */
export function getNextPrayer(prayerTimes: SimplePrayerTime[]): SimplePrayerTime | null {
  return prayerTimes.find(prayer => prayer.isNext) || null;
}

/**
 * Format date to Indonesian format
 */
export function formatDateToIndonesian(date: Date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return date.toLocaleDateString('id-ID', options);
}

/**
 * Generate time options within prayer's valid range (every 5 minutes)
 */
export function generateValidTimeOptions(prayerName: string, prayerTimes: SimplePrayerTime[]): string[] {
  const range = getValidPrayerTimeRange(prayerName, prayerTimes);
  if (!range) return [];
  
  const options: string[] = [];
  const startMinutes = timeStringToMinutes(range.min);
  const endMinutes = timeStringToMinutes(range.max);
  
  // Generate options every 5 minutes
  for (let minutes = startMinutes; minutes <= endMinutes; minutes += 5) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    options.push(timeString);
  }
  
  return options;
}

/**
 * Get valid time range for a specific prayer
 */
export function getValidPrayerTimeRange(prayerName: string, prayerTimes: SimplePrayerTime[]): { min: string; max: string } | null {
  if (!prayerTimes.length) return null;
  
  const currentPrayerIndex = prayerTimes.findIndex(p => p.name === prayerName);
  if (currentPrayerIndex === -1) return null;
  
  const currentPrayer = prayerTimes[currentPrayerIndex];
  const nextPrayer = prayerTimes[currentPrayerIndex + 1];
  
  // Start time is the prayer's scheduled time
  const min = currentPrayer.time;
  
  // End time is before the next prayer, or midnight for Isya
  let max: string;
  if (nextPrayer) {
    // Calculate end time as 1 minute before next prayer
    const nextMinutes = timeStringToMinutes(nextPrayer.time);
    const endMinutes = nextMinutes - 1;
    const hours = Math.floor(endMinutes / 60);
    const minutes = endMinutes % 60;
    max = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } else {
    // For Isya (last prayer), valid until 23:59
    max = "23:59";
  }
  
  return { min, max };
}

/**
 * Validate if input time is within prayer's valid range
 */
export function isValidPrayerTime(inputTime: string, prayerName: string, prayerTimes: SimplePrayerTime[]): boolean {
  const range = getValidPrayerTimeRange(prayerName, prayerTimes);
  if (!range) return false;
  
  const inputMinutes = timeStringToMinutes(inputTime);
  const minMinutes = timeStringToMinutes(range.min);
  const maxMinutes = timeStringToMinutes(range.max);
  
  return inputMinutes >= minMinutes && inputMinutes <= maxMinutes;
}

/**
 * Get current prayer status message
 */
export function getCurrentPrayerStatus(prayerTimes: SimplePrayerTime[]): string {
  const nextPrayer = getNextPrayer(prayerTimes);
  
  if (!nextPrayer) {
    return 'Menentukan waktu shalat...';
  }
  
  const minutesUntil = getMinutesUntilPrayer(nextPrayer.time);
  const timeUntil = formatMinutesToTime(minutesUntil);
  
  if (minutesUntil <= 15) {
    return `Waktu ${nextPrayer.name} akan tiba dalam ${timeUntil}`;
  }
  
  if (minutesUntil <= 60) {
    return `${timeUntil} menuju ${nextPrayer.name}`;
  }
  
  return `Waktu ${nextPrayer.name} masih ${timeUntil} lagi`;
}

/**
 * Get current active prayer time (the prayer time that is currently happening)
 */
export function getCurrentActivePrayer(prayerTimes: SimplePrayerTime[]): SimplePrayerTime | null {
  const currentMinutes = getCurrentTimeInMinutes();
  
  for (let i = 0; i < prayerTimes.length; i++) {
    const current = prayerTimes[i];
    const next = prayerTimes[i + 1];
    
    const currentPrayerMinutes = timeStringToMinutes(current.time);
    
    if (!next) {
      // Last prayer of the day (Isya) - valid until midnight
      if (currentMinutes >= currentPrayerMinutes) {
        return current;
      }
    } else {
      const nextPrayerMinutes = timeStringToMinutes(next.time);
      
      // Current time is within this prayer's window
      if (currentMinutes >= currentPrayerMinutes && currentMinutes < nextPrayerMinutes) {
        return current;
      }
    }
  }
  
  // If current time is before Subuh, it's still Isya time from yesterday
  const subuhMinutes = timeStringToMinutes(prayerTimes[0].time);
  if (currentMinutes < subuhMinutes) {
    return prayerTimes[4]; // Isya
  }
  
  return null;
}

/**
 * Check if we are currently in a prayer time window
 */
export function isInPrayerWindow(prayerTimes: SimplePrayerTime[]): boolean {
  return getCurrentActivePrayer(prayerTimes) !== null;
}

/**
 * Get time until current prayer window ends
 */
export function getMinutesUntilPrayerEnds(prayerTimes: SimplePrayerTime[]): number {
  const activePrayer = getCurrentActivePrayer(prayerTimes);
  if (!activePrayer) return 0;
  
  const currentMinutes = getCurrentTimeInMinutes();
  const activePrayerIndex = prayerTimes.findIndex(p => p.name === activePrayer.name);
  
  if (activePrayerIndex === 4) { // Isya - ends at midnight
    const minutesToMidnight = 24 * 60 - currentMinutes;
    return minutesToMidnight;
  }
  
  const nextPrayer = prayerTimes[activePrayerIndex + 1];
  if (nextPrayer) {
    const nextPrayerMinutes = timeStringToMinutes(nextPrayer.time);
    return nextPrayerMinutes - currentMinutes;
  }
  
  return 0;
}