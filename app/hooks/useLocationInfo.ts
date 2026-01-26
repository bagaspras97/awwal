'use client';

import { useState, useEffect } from 'react';
import { LocationService, LocationInfo } from '@/app/services/locationService';

/**
 * Hook to get current location information
 */
export function useLocationInfo() {
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchLocationInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const info = await LocationService.getCurrentLocationInfo();

        console.log({info});
        
        if (!isCancelled) {
          setLocationInfo(info);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Gagal mendapatkan info lokasi');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchLocationInfo();

    return () => {
      isCancelled = true;
    };
  }, []);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const info = await LocationService.getCurrentLocationInfo();
      setLocationInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mendapatkan info lokasi');
    } finally {
      setLoading(false);
    }
  };

  return {
    locationInfo,
    loading,
    error,
    refetch
  };
}