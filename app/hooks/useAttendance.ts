'use client';

import { useState, useEffect } from 'react';
import { AttendanceService } from '@/app/services/attendanceService';
import { DailyPrayerAttendance } from '@/app/types/attendance';

/**
 * Hook to manage prayer attendance
 */
export function useAttendance() {
  const [todayAttendance, setTodayAttendance] = useState<DailyPrayerAttendance | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAttendance = () => {
    try {
      const attendance = AttendanceService.getTodayAttendance();
      setTodayAttendance(attendance);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAttendance();

    // Listen for attendance updates
    const handleAttendanceUpdate = () => {
      refreshAttendance();
    };

    window.addEventListener('prayerAttendanceUpdated', handleAttendanceUpdate);

    return () => {
      window.removeEventListener('prayerAttendanceUpdated', handleAttendanceUpdate);
    };
  }, []);

  const markAttended = async (prayerName: string, scheduledTime: string) => {
    try {
      AttendanceService.markPrayerAttended(prayerName, scheduledTime);
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  };

  const markCompleted = async (prayerName: string) => {
    try {
      AttendanceService.markPrayerCompleted(prayerName);
    } catch (error) {
      console.error('Error marking completion:', error);
      throw error;
    }
  };

  const markAttendedWithCustomTime = async (prayerName: string, scheduledTime: string, customTime: string) => {
    try {
      AttendanceService.markPrayerAttendedWithCustomTime(prayerName, scheduledTime, customTime);
    } catch (error) {
      console.error('Error marking attendance with custom time:', error);
      throw error;
    }
  };

  const unmarkAttended = async (prayerName: string) => {
    try {
      AttendanceService.unmarkPrayerAttended(prayerName);
    } catch (error) {
      console.error('Error unmarking attendance:', error);
      throw error;
    }
  };

  const isPrayerAttended = (prayerName: string): boolean => {
    if (!todayAttendance) return false;
    const prayer = todayAttendance.prayers[prayerName as keyof typeof todayAttendance.prayers];
    return prayer?.isAttended || false;
  };

  return {
    todayAttendance,
    loading,
    markAttended,
    markCompleted,
    markAttendedWithCustomTime,
    unmarkAttended,
    isPrayerAttended,
    refreshAttendance,
  };
}

/**
 * Hook to get attendance stats
 */
export function useAttendanceStats(days: number = 7) {
  const [stats, setStats] = useState({
    totalPrayers: 0,
    attendedPrayers: 0,
    attendanceRate: 0,
    earlyPrayers: 0,
    earlyRate: 0,
    averageDelayMinutes: 0
  });

  useEffect(() => {
    const updateStats = () => {
      const newStats = AttendanceService.getAttendanceStats(days);
      setStats(newStats);
    };

    updateStats();

    // Listen for attendance updates
    window.addEventListener('prayerAttendanceUpdated', updateStats);

    return () => {
      window.removeEventListener('prayerAttendanceUpdated', updateStats);
    };
  }, [days]);

  return stats;
}