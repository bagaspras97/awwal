'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { AttendanceRecord } from '../types/attendance';
import { PrayerName } from '../types/prayer';
import { AttendanceApiService } from '../services/attendanceApiService';
import { LocalStorageService } from '../services/localStorageService';
import { useAttendanceSync } from './useAttendanceSync';

export function useUserAttendanceOptimized() {
  const { data: session } = useSession();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { syncStatus, syncToDatabase, updateSyncStatus } = useAttendanceSync();
  const userId = session?.user?.id;

  // Load attendance records from API or localStorage
  const loadAttendanceRecords = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    setIsLoading(true);
    
    try {
      if (session?.user) {
        // Load from API if authenticated
        const records = await AttendanceApiService.getAttendances();
        setAttendanceRecords(records);
        updateSyncStatus('synced');
      } else {
        // Load from localStorage if not authenticated
        const records = LocalStorageService.getAttendanceRecords();
        setAttendanceRecords(records);
        updateSyncStatus(records.length > 0 ? 'pending' : 'offline');
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading attendance records:', error);
      
      // Fallback to localStorage
      const records = LocalStorageService.getAttendanceRecords(userId);
      setAttendanceRecords(records);
      updateSyncStatus(records.length > 0 ? 'pending' : 'offline');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user, userId, updateSyncStatus]);

  // Save attendance records (to both API and localStorage)
  const saveAttendanceRecords = useCallback(async (records: AttendanceRecord[]) => {
    if (typeof window === 'undefined') return;
    
    try {
      // Always save to localStorage first (for offline support)
      LocalStorageService.saveAttendanceRecords(records, userId);
      setAttendanceRecords(records);
      setLastUpdated(new Date());
      
      // Emit custom event for real-time updates
      LocalStorageService.emitUpdateEvent(records);
      
      // Update sync status
      if (session?.user) {
        updateSyncStatus('synced');
      } else {
        updateSyncStatus(records.length > 0 ? 'pending' : 'offline');
      }
    } catch (error) {
      console.error('Error saving attendance records:', error);
      updateSyncStatus('pending');
    }
  }, [session?.user, userId, updateSyncStatus]);

  // Mark attendance for a prayer (Simple method)
  const markPrayerCompleted = useCallback(async (prayerName: PrayerName) => {
    const dateKey = new Date().toISOString().split('T')[0];
    const currentRecords = Array.isArray(attendanceRecords) ? attendanceRecords : [];
    
    if (session?.user) {
      try {
        // Save to API first
        const savedRecord = await AttendanceApiService.saveAttendance(prayerName, {
          date: dateKey,
          method: 'simple'
        });
        
        // Update local records with API response
        const updatedRecords = currentRecords.filter(r => 
          !(r.date === savedRecord.date && r.prayerName === savedRecord.prayerName)
        );
        updatedRecords.push(savedRecord);
        await saveAttendanceRecords(updatedRecords);
      } catch (error) {
        console.error('Error saving to API, falling back to localStorage:', error);
        
        // Fallback to localStorage only
        const localRecord: AttendanceRecord = {
          id: `${prayerName}-${dateKey}-${Date.now()}`,
          date: dateKey,
          prayerName: prayerName,
          attendedAt: new Date().toISOString(),
          timeStatus: 'on_time',
          location: 'Unknown',
          method: 'simple'
        };
        
        const updatedRecords = [...currentRecords, localRecord];
        await saveAttendanceRecords(updatedRecords);
      }
    } else {
      // Save to localStorage only
      const localRecord: AttendanceRecord = {
        id: `${prayerName}-${dateKey}-${Date.now()}`,
        date: dateKey,
        prayerName: prayerName,
        attendedAt: new Date().toISOString(),
        timeStatus: 'on_time',
        location: 'Unknown',
        method: 'simple'
      };
      
      const updatedRecords = [...currentRecords, localRecord];
      await saveAttendanceRecords(updatedRecords);
    }
  }, [attendanceRecords, saveAttendanceRecords, session?.user]);

  // Mark attendance with custom time (Detailed method)
  const markPrayerAttendedWithCustomTime = useCallback(async (prayerName: PrayerName, customTime: string) => {
    const dateKey = new Date().toISOString().split('T')[0];
    const currentRecords = Array.isArray(attendanceRecords) ? attendanceRecords : [];
    
    if (session?.user) {
      try {
        // Save to API first
        const savedRecord = await AttendanceApiService.saveAttendance(prayerName, {
          date: dateKey,
          customTime,
          method: 'detailed'
        });
        
        // Update local records with API response
        const updatedRecords = currentRecords.filter(r => 
          !(r.date === savedRecord.date && r.prayerName === savedRecord.prayerName)
        );
        updatedRecords.push(savedRecord);
        await saveAttendanceRecords(updatedRecords);
      } catch (error) {
        console.error('Error saving to API, falling back to localStorage:', error);
        
        // Fallback to localStorage only
        const localRecord: AttendanceRecord = {
          id: `${prayerName}-${dateKey}-${Date.now()}`,
          date: dateKey,
          prayerName: prayerName,
          attendedAt: new Date().toISOString(),
          timeStatus: 'on_time',
          location: 'Unknown',
          customTime: customTime,
          method: 'detailed'
        };
        
        const updatedRecords = [...currentRecords, localRecord];
        await saveAttendanceRecords(updatedRecords);
      }
    } else {
      // Save to localStorage only
      const localRecord: AttendanceRecord = {
        id: `${prayerName}-${dateKey}-${Date.now()}`,
        date: dateKey,
        prayerName: prayerName,
        attendedAt: new Date().toISOString(),
        timeStatus: 'on_time',
        location: 'Unknown',
        customTime: customTime,
        method: 'detailed'
      };
      
      const updatedRecords = [...currentRecords, localRecord];
      await saveAttendanceRecords(updatedRecords);
    }
  }, [attendanceRecords, saveAttendanceRecords, session?.user]);

  // Remove attendance for a prayer
  const unmarkPrayer = useCallback(async (prayerName: PrayerName, date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const currentRecords = Array.isArray(attendanceRecords) ? attendanceRecords : [];
    
    const recordToRemove = currentRecords.find(record => 
      record.date === targetDate && record.prayerName === prayerName
    );
    
    if (!recordToRemove) return;
    
    const updatedRecords = currentRecords.filter(record => 
      !(record.date === targetDate && record.prayerName === prayerName)
    );
    
    if (session?.user) {
      try {
        // Delete from API
        await AttendanceApiService.deleteAttendance(prayerName, targetDate);
        await saveAttendanceRecords(updatedRecords);
      } catch (error) {
        console.error('Error deleting from API, falling back to localStorage:', error);
        await saveAttendanceRecords(updatedRecords);
      }
    } else {
      // Remove from localStorage only
      await saveAttendanceRecords(updatedRecords);
    }
  }, [attendanceRecords, saveAttendanceRecords, session?.user]);

  // Get prayer attendance for a specific date
  const getPrayerAttendance = useCallback((prayerName: PrayerName, date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Defensive check to ensure attendanceRecords is an array
    if (!Array.isArray(attendanceRecords)) {
      console.warn('attendanceRecords is not an array:', attendanceRecords);
      return null;
    }
    
    const record = attendanceRecords.find(record => 
      record.date === targetDate && record.prayerName === prayerName
    );
    
    if (record) {
      return {
        completed: true,
        completedAt: record.attendedAt,
        customTime: record.customTime,
        method: record.method
      };
    }
    
    return null;
  }, [attendanceRecords]);

  // Get attendance statistics
  const getAttendanceStats = useCallback(async () => {
    if (session?.user) {
      try {
        return await AttendanceApiService.getStats();
      } catch (error) {
        console.error('Error fetching stats from API:', error);
      }
    }
    
    // Fallback to localStorage calculation
    const currentRecords = Array.isArray(attendanceRecords) ? attendanceRecords : [];
    const uniqueDates = [...new Set(currentRecords.map(r => r.date))];
    const totalPrayers = currentRecords.length;
    
    return {
      totalDays: uniqueDates.length,
      totalPrayers: totalPrayers,
      completedPrayers: totalPrayers, // All records are completed
      completionRate: totalPrayers > 0 ? 100 : 0
    };
  }, [attendanceRecords, session?.user]);

  // Auto-sync when user logs in
  useEffect(() => {
    if (session?.user && syncStatus === 'pending') {
      syncToDatabase();
    }
  }, [session?.user, syncStatus, syncToDatabase]);

  // Listen for custom attendance updates
  useEffect(() => {
    const handleAttendanceUpdate = (event: CustomEvent) => {
      setAttendanceRecords(event.detail.records);
      setLastUpdated(event.detail.lastUpdated);
    };

    window.addEventListener('attendanceUpdate', handleAttendanceUpdate as EventListener);
    
    return () => {
      window.removeEventListener('attendanceUpdate', handleAttendanceUpdate as EventListener);
    };
  }, []);

  // Initial load
  useEffect(() => {
    loadAttendanceRecords();
  }, [loadAttendanceRecords]);

  return {
    attendanceRecords,
    lastUpdated,
    isLoading,
    syncStatus,
    markPrayerCompleted,
    markPrayerAttendedWithCustomTime,
    unmarkPrayer,
    getPrayerAttendance,
    getAttendanceStats,
    loadAttendanceRecords,
    syncToDatabase,
    isAuthenticated: !!session,
    user: session?.user || null
  };
}