'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { AttendanceApiService } from '../services/attendanceApiService';
import { LocalStorageService } from '../services/localStorageService';

type SyncStatus = 'synced' | 'pending' | 'syncing' | 'offline';

export function useAttendanceSync() {
  const { data: session } = useSession();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');

  const syncToDatabase = useCallback(async (): Promise<boolean> => {
    if (!session?.user || typeof globalThis.window === 'undefined') return false;
    
    setSyncStatus('syncing');
    
    try {
      // Try to migrate old format first
      const migratedRecords = LocalStorageService.migrateOldFormat(session.user.id);
      
      // Get current records
      const currentRecords = migratedRecords.length > 0 
        ? migratedRecords 
        : LocalStorageService.getAttendanceRecords(session.user.id);
      
      if (currentRecords.length > 0) {
        const result = await AttendanceApiService.syncData(currentRecords);
        console.log('Sync completed:', result);
      }
      
      setSyncStatus('synced');
      return true;
    } catch (error) {
      console.error('Error syncing to database:', error);
      setSyncStatus('pending');
      return false;
    }
  }, [session]);

  const updateSyncStatus = useCallback((status: SyncStatus) => {
    setSyncStatus(status);
  }, []);

  return {
    syncStatus,
    syncToDatabase,
    updateSyncStatus
  };
}