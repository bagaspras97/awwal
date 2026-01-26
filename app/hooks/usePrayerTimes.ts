import { useQuery } from '@tanstack/react-query';
import { PrayerTimesService } from '@/app/services/prayerTimesService';
import { SimplePrayerTime, Coordinates, PrayerTimesParams } from '@/app/types/prayer';

/**
 * Hook to get prayer times for current location
 */
export function usePrayerTimes() {
  return useQuery({
    queryKey: ['prayerTimes', 'current'],
    queryFn: () => PrayerTimesService.getPrayerTimesForCurrentLocation(),
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    retry: 3,
  });
}

/**
 * Hook to get prayer times for specific location
 */
export function usePrayerTimesForLocation(coordinates: Coordinates | null) {
  return useQuery({
    queryKey: ['prayerTimes', 'location', coordinates],
    queryFn: async () => {
      if (!coordinates) throw new Error('No coordinates provided');
      
      const response = await PrayerTimesService.getPrayerTimes({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        method: 20,
        school: 0,
      });
      
      return PrayerTimesService.formatPrayerTimesForDisplay(response);
    },
    enabled: !!coordinates,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get current user location
 */
export function useCurrentLocation() {
  return useQuery({
    queryKey: ['location', 'current'],
    queryFn: () => PrayerTimesService.getCurrentLocation(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * Hook to get next prayer information
 */
export function useNextPrayer() {
  const { data: prayerTimes, ...queryState } = usePrayerTimes();
  
  const nextPrayer = prayerTimes?.find(prayer => prayer.isNext);
  
  return {
    ...queryState,
    nextPrayer,
    allPrayers: prayerTimes,
  };
}