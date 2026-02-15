'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { AttendanceRecord } from '../types/attendance';
import { PrayerName } from '../types/prayer';

export function useUserAttendance() {
  const { data: session } = useSession();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing' | 'offline'>('offline');

  const userId = session?.user?.id;
  
  // Generate storage key berdasarkan user login status
  const getStorageKey = (baseKey: string) => {
    return userId ? `${baseKey}_user_${userId}` : baseKey;
  };

  // Load attendance records from API or localStorage
  const loadAttendanceRecords = useCallback(async () => {
    if (typeof globalThis.window === 'undefined') return;
    
    setIsLoading(true);
    
    try {
      if (session?.user) {
        // Load from API if authenticated
        const response = await fetch('/api/attendance');
        if (response.ok) {
          const result = await response.json();
          console.log('API Response:', result);
          
          // Convert API response to frontend format
          const records: AttendanceRecord[] = result.attendances.map((attendance: any) => ({
            id: `${attendance.prayerName}-${attendance.prayerDate}-${attendance.id}`,
            date: attendance.prayerDate.split('T')[0],
            prayerName: attendance.prayerName,
            attendedAt: attendance.attendedAt,
            timeStatus: attendance.isEarly === true ? 'early' : attendance.isEarly === false ? 'late' : 'on_time',
            location: 'Unknown',
            customTime: attendance.customTime,
            method: attendance.method || 'simple'
          }));
          
          setAttendanceRecords(records);
          setSyncStatus('synced');
        } else {
          throw new Error('Failed to fetch from API');
        }
      } else {
        // Load from localStorage if not authenticated
        const stored = localStorage.getItem(getStorageKey('attendanceRecords'));
        let records = [];
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            records = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            console.error('Error parsing localStorage data:', e);
            records = [];
          }
        }
        setAttendanceRecords(records);
        setSyncStatus(records.length > 0 ? 'pending' : 'offline');
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading attendance records:', error);
      
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(getStorageKey('attendanceRecords'));
        let records = [];
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            records = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            console.error('Error parsing localStorage fallback data:', e);
            records = [];
          }
        }
        setAttendanceRecords(records);
        setSyncStatus(records.length > 0 ? 'pending' : 'offline');
      } catch (fallbackError) {
        console.error('Error loading from localStorage:', fallbackError);
        setAttendanceRecords([]);
        setSyncStatus('offline');
      }
    } finally {
      setIsLoading(false);
    }
  }, [session?.user, userId]);

  // Save attendance records (to both API and localStorage)
  const saveAttendanceRecords = useCallback(async (records: AttendanceRecord[]) => {
    if (typeof globalThis.window === 'undefined') return;
    
    try {
      // Always save to localStorage first (for offline support)
      localStorage.setItem(getStorageKey('attendanceRecords'), JSON.stringify(records));
      setAttendanceRecords(records);
      setLastUpdated(new Date());
      
      // Emit custom event for real-time updates
      globalThis.window.dispatchEvent(new CustomEvent('attendanceUpdate', { 
        detail: { records, lastUpdated: new Date() } 
      }));
      
      // If authenticated, we'll sync on next operation
      if (session?.user) {
        setSyncStatus('synced');
      } else {
        setSyncStatus(records.length > 0 ? 'pending' : 'offline');
      }
    } catch (error) {
      console.error('Error saving attendance records:', error);
      setSyncStatus('pending');
    }
  }, [session?.user, userId]);

  // Sync localStorage data to database
  const syncToDatabase = useCallback(async () => {
    if (!session?.user || typeof globalThis.window === 'undefined') return;
    
    setSyncStatus('syncing');
    
    try {
      // Migrate old prayerAttendance format to new attendanceRecords format
      const oldFormatKey = getStorageKey('prayerAttendance');
      const newFormatKey = getStorageKey('attendanceRecords');
      
      const oldData = localStorage.getItem(oldFormatKey);
      let recordsToSync: AttendanceRecord[] = [];
      
      if (oldData) {
        const parsedOldData = JSON.parse(oldData);
        recordsToSync = [];
        
        // Convert old format to new format
        Object.keys(parsedOldData).forEach(date => {
          const dayData = parsedOldData[date];
          Object.keys(dayData).forEach(prayerName => {
            const prayerData = dayData[prayerName];
            if (prayerData.completed) {
              recordsToSync.push({
                id: `${prayerName}-${date}-${Date.now()}-${Math.random()}`,
                date: date,
                prayerName: prayerName,
                attendedAt: prayerData.completedAt || new Date().toISOString(),
                timeStatus: 'on_time',
                location: 'Unknown',
                customTime: prayerData.customTime || null,
                method: prayerData.method || 'simple'
              });
            }
          });
        });
        
        // Save to new format in localStorage
        localStorage.setItem(newFormatKey, JSON.stringify(recordsToSync));
      } else {
        // Check if we have new format data
        const newData = localStorage.getItem(newFormatKey);
        recordsToSync = newData ? JSON.parse(newData) : [];
      }
      
      if (recordsToSync.length > 0) {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ records: recordsToSync })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Sync completed:', result);
          setSyncStatus('synced');
          
          // Clean up old format data
          localStorage.removeItem(oldFormatKey);
          
          // Reload from database to get the latest data
          await loadAttendanceRecords();
        } else {
          throw new Error('Sync failed');
        }
      } else {
        setSyncStatus('synced');
      }
    } catch (error) {
      console.error('Error syncing to database:', error);
      setSyncStatus('pending');
    }
  }, [session?.user, loadAttendanceRecords, userId]);

  // Mark attendance for a prayer (Simple method)
  const markPrayerCompleted = useCallback(async (prayerName: PrayerName) => {
    const dateKey = new Date().toISOString().split('T')[0];
    
    // Create record for frontend (using old format for compatibility)
    const newRecord: AttendanceRecord = {
      id: `${prayerName}-${dateKey}-${Date.now()}`,
      date: dateKey,
      prayerName: prayerName,
      attendedAt: new Date().toISOString(),
      timeStatus: 'on_time',
      location: 'Unknown',
      method: 'simple'
    };

    const currentRecords = Array.isArray(attendanceRecords) ? attendanceRecords : [];
    const updatedRecords = [...currentRecords, newRecord];
    
    if (session?.user) {
      try {
        // Prepare data for API (using correct format)
        const apiData = {
          prayerName: prayerName,
          prayerDate: dateKey,
          scheduledTime: '00:00', // Default value, will be updated later with actual prayer times
          method: 'simple'
        };
        
        console.log('Saving to API:', apiData);
        const response = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiData)
        });
        
        console.log('API Response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Saved record:', result);
          
          // Convert API response back to frontend format
          const savedRecord: AttendanceRecord = {
            id: `${result.attendance.prayerName}-${result.attendance.prayerDate}-${Date.now()}`,
            date: result.attendance.prayerDate.split('T')[0],
            prayerName: result.attendance.prayerName,
            attendedAt: result.attendance.attendedAt,
            timeStatus: 'on_time',
            location: 'Unknown',
            method: result.attendance.method || 'simple'
          };
          
          // Update with the server response
          const currentRecords2 = Array.isArray(attendanceRecords) ? attendanceRecords : [];
          const serverUpdatedRecords = currentRecords2.filter(r => 
            !(r.date === savedRecord.date && r.prayerName === savedRecord.prayerName)
          );
          serverUpdatedRecords.push(savedRecord);
          await saveAttendanceRecords(serverUpdatedRecords);
        } else {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Failed to save to API: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.error('Error saving to API, falling back to localStorage:', error);
        await saveAttendanceRecords(updatedRecords);
      }
    } else {
      // Save to localStorage only
      await saveAttendanceRecords(updatedRecords);
    }
  }, [attendanceRecords, saveAttendanceRecords, session?.user]);

  // Mark attendance with custom time (Detailed method)
  const markPrayerAttendedWithCustomTime = useCallback(async (prayerName: PrayerName, customTime: string) => {
    const dateKey = new Date().toISOString().split('T')[0];
    
    // Create record for frontend (using old format for compatibility)
    const newRecord: AttendanceRecord = {
      id: `${prayerName}-${dateKey}-${Date.now()}`,
      date: dateKey,
      prayerName: prayerName,
      attendedAt: new Date().toISOString(),
      timeStatus: 'on_time',
      location: 'Unknown',
      customTime: customTime,
      method: 'detailed'
    };

    const currentRecords = Array.isArray(attendanceRecords) ? attendanceRecords : [];
    const updatedRecords = [...currentRecords, newRecord];
    
    if (session?.user) {
      try {
        // Prepare data for API (using correct format)
        const apiData = {
          prayerName: prayerName,
          prayerDate: dateKey,
          scheduledTime: '00:00', // Default value, will be updated later with actual prayer times
          customTime: customTime,
          method: 'detailed'
        };
        
        console.log('Saving to API:', apiData);
        const response = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiData)
        });
        
        console.log('API Response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Saved record:', result);
          
          // Convert API response back to frontend format
          const savedRecord: AttendanceRecord = {
            id: `${result.attendance.prayerName}-${result.attendance.prayerDate}-${Date.now()}`,
            date: result.attendance.prayerDate.split('T')[0],
            prayerName: result.attendance.prayerName,
            attendedAt: result.attendance.attendedAt,
            timeStatus: 'on_time',
            location: 'Unknown',
            customTime: result.attendance.customTime,
            method: result.attendance.method || 'detailed'
          };
          
          // Update with the server response
          const currentRecords2 = Array.isArray(attendanceRecords) ? attendanceRecords : [];
          const serverUpdatedRecords = currentRecords2.filter(r => 
            !(r.date === savedRecord.date && r.prayerName === savedRecord.prayerName)
          );
          serverUpdatedRecords.push(savedRecord);
          await saveAttendanceRecords(serverUpdatedRecords);
        } else {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Failed to save to API: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.error('Error saving to API, falling back to localStorage:', error);
        await saveAttendanceRecords(updatedRecords);
      }
    } else {
      // Save to localStorage only
      await saveAttendanceRecords(updatedRecords);
    }
  }, [attendanceRecords, saveAttendanceRecords, session?.user]);

  // Remove attendance for a prayer
  const unmarkPrayer = useCallback(async (prayerName: PrayerName, date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Defensive check to ensure attendanceRecords is an array
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
        // Delete from API using correct parameters
        const response = await fetch(`/api/attendance?prayerName=${encodeURIComponent(prayerName)}&prayerDate=${encodeURIComponent(targetDate)}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await saveAttendanceRecords(updatedRecords);
        } else {
          throw new Error('Failed to delete from API');
        }
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
        const response = await fetch('/api/stats');
        if (response.ok) {
          const apiStats = await response.json();
          // Map API response to expected format
          return {
            totalDays: apiStats.uniqueDays || 0,
            totalPrayers: apiStats.uniqueDays * 5 || 0, // 5 prayers per day
            completedPrayers: apiStats.totalRecords || 0,
            completionRate: apiStats.completionRate || 0
          };
        }
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

    globalThis.window.addEventListener('attendanceUpdate', handleAttendanceUpdate as EventListener);
    
    return () => {
      globalThis.window.removeEventListener('attendanceUpdate', handleAttendanceUpdate as EventListener);
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
    user: session?.user ?? null
  };
}