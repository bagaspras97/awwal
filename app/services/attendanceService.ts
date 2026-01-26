import { PrayerAttendance, DailyPrayerAttendance } from '@/app/types/attendance';

const STORAGE_KEY = 'awwal_prayer_attendance';

export class AttendanceService {
  /**
   * Get all attendance data from localStorage
   */
  static getAllAttendance(): DailyPrayerAttendance[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading attendance data:', error);
      return [];
    }
  }

  /**
   * Get attendance for a specific date
   */
  static getAttendanceByDate(date: string): DailyPrayerAttendance | null {
    const allAttendance = this.getAllAttendance();
    return allAttendance.find(record => record.date === date) || null;
  }

  /**
   * Get today's attendance
   */
  static getTodayAttendance(): DailyPrayerAttendance {
    const today = this.getCurrentDateString();
    const attendance = this.getAttendanceByDate(today);
    
    if (attendance) {
      return attendance;
    }

    // Return empty attendance for today
    return {
      date: today,
      prayers: {}
    };
  }

  /**
   * Mark prayer as attended
   */
  static markPrayerAttended(prayerName: string, scheduledTime: string): void {
    try {
      const today = this.getCurrentDateString();
      const currentTime = new Date();
      const actualTime = this.formatCurrentTime(currentTime);
      const allAttendance = this.getAllAttendance();
      
      // Calculate if prayer is done early or late
      const { isEarly, delayMinutes } = this.calculateTimingAnalysis(scheduledTime, actualTime);
      
      // Find today's record or create new one
      let todayRecord = allAttendance.find(record => record.date === today);
      
      if (!todayRecord) {
        todayRecord = {
          date: today,
          prayers: {}
        };
        allAttendance.push(todayRecord);
      }

      // Mark the prayer as attended with actual time
      const attendance: PrayerAttendance = {
        prayerName,
        date: today,
        scheduledTime,
        actualTime,
        attendedAt: currentTime.toISOString(),
        isAttended: true,
        isEarly,
        delayMinutes: delayMinutes > 0 ? delayMinutes : undefined
      };

      todayRecord.prayers[prayerName as keyof typeof todayRecord.prayers] = attendance;

      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allAttendance));
      
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('prayerAttendanceUpdated', {
        detail: { prayerName, date: today, isEarly, delayMinutes }
      }));

    } catch (error) {
      console.error('Error saving prayer attendance:', error);
      throw new Error('Gagal menyimpan data absensi');
    }
  }

  /**
   * Mark prayer as completed (simple attendance without time tracking)
   */
  static markPrayerCompleted(prayerName: string): void {
    try {
      const today = this.getCurrentDateString();
      const allAttendance = this.getAllAttendance();
      
      // Find today's record or create new one
      let todayRecord = allAttendance.find(record => record.date === today);
      
      if (!todayRecord) {
        todayRecord = {
          date: today,
          prayers: {}
        };
        allAttendance.push(todayRecord);
      }

      // Mark the prayer as completed without time analysis
      const attendance: PrayerAttendance = {
        prayerName,
        date: today,
        scheduledTime: 'N/A',
        actualTime: undefined, // No specific time tracked
        attendedAt: new Date().toISOString(),
        isAttended: true,
        isEarly: undefined, // No timing analysis for simple completion
        delayMinutes: undefined
      };

      todayRecord.prayers[prayerName as keyof typeof todayRecord.prayers] = attendance;

      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allAttendance));
      
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('prayerAttendanceUpdated', {
        detail: { prayerName, date: today, isSimpleCompletion: true }
      }));

    } catch (error) {
      console.error('Error marking prayer completion:', error);
      throw new Error('Gagal menyimpan data shalat');
    }
  }

  /**
   * Mark prayer as attended with custom time (for editing past prayers)
   */
  static markPrayerAttendedWithCustomTime(prayerName: string, scheduledTime: string, customTime: string): void {
    try {
      const today = this.getCurrentDateString();
      const allAttendance = this.getAllAttendance();
      
      // Calculate timing analysis with custom time
      const { isEarly, delayMinutes } = this.calculateTimingAnalysis(scheduledTime, customTime);
      
      // Find today's record or create new one
      let todayRecord = allAttendance.find(record => record.date === today);
      
      if (!todayRecord) {
        todayRecord = {
          date: today,
          prayers: {}
        };
        allAttendance.push(todayRecord);
      }

      // Mark the prayer as attended with custom time
      const attendance: PrayerAttendance = {
        prayerName,
        date: today,
        scheduledTime,
        actualTime: customTime,
        attendedAt: new Date().toISOString(), // When it was recorded, not when prayer was done
        isAttended: true,
        isEarly,
        delayMinutes: delayMinutes > 0 ? delayMinutes : undefined
      };

      todayRecord.prayers[prayerName as keyof typeof todayRecord.prayers] = attendance;

      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allAttendance));
      
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('prayerAttendanceUpdated', {
        detail: { prayerName, date: today, isEarly, delayMinutes, isCustomTime: true }
      }));

    } catch (error) {
      console.error('Error saving prayer attendance with custom time:', error);
      throw new Error('Gagal menyimpan data absensi');
    }
  }

  /**
   * Unmark prayer (if needed for corrections)
   */
  static unmarkPrayerAttended(prayerName: string): void {
    try {
      const today = this.getCurrentDateString();
      const allAttendance = this.getAllAttendance();
      
      const todayRecord = allAttendance.find(record => record.date === today);
      
      if (todayRecord && todayRecord.prayers[prayerName as keyof typeof todayRecord.prayers]) {
        delete todayRecord.prayers[prayerName as keyof typeof todayRecord.prayers];
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allAttendance));
        
        window.dispatchEvent(new CustomEvent('prayerAttendanceUpdated', {
          detail: { prayerName, date: today }
        }));
      }
    } catch (error) {
      console.error('Error removing prayer attendance:', error);
      throw new Error('Gagal menghapus data absensi');
    }
  }

  /**
   * Check if a prayer is attended today
   */
  static isPrayerAttendedToday(prayerName: string): boolean {
    const today = this.getTodayAttendance();
    const prayer = today.prayers[prayerName as keyof typeof today.prayers];
    return prayer?.isAttended || false;
  }

  /**
   * Get current date string in YYYY-MM-DD format
   */
  private static getCurrentDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Format current time to HH:MM
   */
  private static formatCurrentTime(date: Date): string {
    return date.toTimeString().slice(0, 5); // HH:MM format
  }

  /**
   * Calculate timing analysis for prayer attendance
   */
  private static calculateTimingAnalysis(scheduledTime: string, actualTime: string): {
    isEarly: boolean;
    delayMinutes: number;
  } {
    const [scheduledHours, scheduledMinutes] = scheduledTime.split(':').map(Number);
    const [actualHours, actualMinutes] = actualTime.split(':').map(Number);
    
    const scheduledTotalMinutes = scheduledHours * 60 + scheduledMinutes;
    const actualTotalMinutes = actualHours * 60 + actualMinutes;
    
    const delayMinutes = actualTotalMinutes - scheduledTotalMinutes;
    
    // Consider early if done within 30 minutes after scheduled time
    // or if done before scheduled time
    const isEarly = delayMinutes <= 30;
    
    return {
      isEarly,
      delayMinutes: Math.max(0, delayMinutes)
    };
  }

  /**
   * Convert time string to minutes from midnight
   */
  private static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Get attendance stats for recent days
   */
  static getAttendanceStats(days: number = 7): {
    totalPrayers: number;
    attendedPrayers: number;
    attendanceRate: number;
    earlyPrayers: number;
    earlyRate: number;
    averageDelayMinutes: number;
  } {
    const allAttendance = this.getAllAttendance();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentAttendance = allAttendance.filter(record => {
      return new Date(record.date) >= cutoffDate;
    });

    const totalPossiblePrayers = recentAttendance.length * 5; // 5 prayers per day
    let attendedPrayers = 0;
    let earlyPrayers = 0;
    let totalDelayMinutes = 0;
    let delayCount = 0;

    recentAttendance.forEach(record => {
      const prayers = Object.values(record.prayers).filter(prayer => prayer.isAttended);
      attendedPrayers += prayers.length;
      
      prayers.forEach(prayer => {
        if (prayer.isEarly) {
          earlyPrayers++;
        }
        if (prayer.delayMinutes && prayer.delayMinutes > 0) {
          totalDelayMinutes += prayer.delayMinutes;
          delayCount++;
        }
      });
    });

    const attendanceRate = totalPossiblePrayers > 0 ? (attendedPrayers / totalPossiblePrayers) * 100 : 0;
    const earlyRate = attendedPrayers > 0 ? (earlyPrayers / attendedPrayers) * 100 : 0;
    const averageDelayMinutes = delayCount > 0 ? totalDelayMinutes / delayCount : 0;

    return {
      totalPrayers: totalPossiblePrayers,
      attendedPrayers,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      earlyPrayers,
      earlyRate: Math.round(earlyRate * 100) / 100,
      averageDelayMinutes: Math.round(averageDelayMinutes)
    };
  }

  /**
   * Clear all attendance data (for development/reset)
   */
  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('prayerAttendanceUpdated'));
  }
}