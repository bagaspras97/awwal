import { useState, useEffect } from 'react';
import { SimplePrayerTime } from '@/app/types/prayer';
import { getCurrentPrayerStatus } from '@/app/utils/time';

/**
 * Hook untuk mendapatkan status real-time yang update setiap menit
 */
export function useRealTimeStatus(prayerTimes: SimplePrayerTime[]) {
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    // Update status immediately
    const updateStatus = () => {
      if (prayerTimes.length > 0) {
        setStatus(getCurrentPrayerStatus(prayerTimes));
      }
    };

    updateStatus();

    // Set interval untuk update setiap menit
    const interval = setInterval(updateStatus, 60000); // 60 detik

    // Cleanup interval saat unmount
    return () => clearInterval(interval);
  }, [prayerTimes]);

  return status;
}