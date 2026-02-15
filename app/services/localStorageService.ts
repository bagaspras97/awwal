'use client';

import { AttendanceRecord } from '../types/attendance';

export class LocalStorageService {
  private static getStorageKey(baseKey: string, userId?: string): string {
    return userId ? `${baseKey}_user_${userId}` : baseKey;
  }

  static saveAttendanceRecords(records: AttendanceRecord[], userId?: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const key = this.getStorageKey('attendanceRecords', userId);
      localStorage.setItem(key, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  static getAttendanceRecords(userId?: string): AttendanceRecord[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const key = this.getStorageKey('attendanceRecords', userId);
      const stored = localStorage.getItem(key);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    
    return [];
  }

  static migrateOldFormat(userId?: string): AttendanceRecord[] {
    if (typeof window === 'undefined') return [];

    try {
      const oldKey = this.getStorageKey('prayerAttendance', userId);
      const newKey = this.getStorageKey('attendanceRecords', userId);
      
      const oldData = localStorage.getItem(oldKey);
      if (!oldData) return [];

      const parsedOldData = JSON.parse(oldData);
      const migratedRecords: AttendanceRecord[] = [];

      Object.keys(parsedOldData).forEach(date => {
        const dayData = parsedOldData[date];
        Object.keys(dayData).forEach(prayerName => {
          const prayerData = dayData[prayerName];
          if (prayerData.completed) {
            migratedRecords.push({
              id: `${prayerName}-${date}-${Date.now()}-${Math.random()}`,
              date: date,
              prayerName: prayerName,
              attendedAt: prayerData.completedAt || new Date().toISOString(),
              timeStatus: 'on_time',
              location: 'Unknown',
              customTime: prayerData.customTime || undefined,
              method: prayerData.method || 'simple'
            });
          }
        });
      });

      // Save in new format and remove old format
      if (migratedRecords.length > 0) {
        localStorage.setItem(newKey, JSON.stringify(migratedRecords));
        localStorage.removeItem(oldKey);
      }

      return migratedRecords;
    } catch (error) {
      console.error('Error migrating old format:', error);
      return [];
    }
  }

  static emitUpdateEvent(records: AttendanceRecord[]): void {
    if (typeof window === 'undefined') return;
    
    window.dispatchEvent(new CustomEvent('attendanceUpdate', { 
      detail: { records, lastUpdated: new Date() } 
    }));
  }
}