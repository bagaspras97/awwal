import { PrayerTimesApiResponse, SimplePrayerTime, PrayerTimesParams, Coordinates } from '@/app/types/prayer';

const API_BASE_URL = 'https://api.aladhan.com/v1';

export class PrayerTimesService {
  /**
   * Get prayer times for a specific location and date
   */
  static async getPrayerTimes(params: PrayerTimesParams): Promise<PrayerTimesApiResponse> {
    const { latitude, longitude, method = 20, school = 0, date } = params;
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      method: method.toString(),
      school: school.toString(),
    });

    if (date) {
      queryParams.append('date', date);
    }

    const url = `${API_BASE_URL}/timings?${queryParams.toString()}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data: PrayerTimesApiResponse = await response.json();
      
      if (data.code !== 200) {
        throw new Error(`API returned error code: ${data.code}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      throw error;
    }
  }

  /**
   * Get current location using browser geolocation API
   */
  static async getCurrentLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let errorMessage = 'Unable to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  /**
   * Format prayer times for display with Indonesian names
   */
  static formatPrayerTimesForDisplay(data: PrayerTimesApiResponse): SimplePrayerTime[] {
    const { timings } = data.data;
    
    const prayerTimes: SimplePrayerTime[] = [
      {
        name: 'Subuh',
        nameArabic: 'الفجر',
        time: this.formatTime(timings.Fajr),
      },
      {
        name: 'Dzuhur',
        nameArabic: 'الظهر',
        time: this.formatTime(timings.Dhuhr),
      },
      {
        name: 'Ashar',
        nameArabic: 'العصر',
        time: this.formatTime(timings.Asr),
      },
      {
        name: 'Maghrib',
        nameArabic: 'المغرب',
        time: this.formatTime(timings.Maghrib),
      },
      {
        name: 'Isya',
        nameArabic: 'العشاء',
        time: this.formatTime(timings.Isha),
      },
    ];

    // Determine which prayer is next and which have passed
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentHour = now.getHours();
    
    let nextPrayerFound = false;
    
    prayerTimes.forEach((prayer) => {
      const prayerMinutes = this.timeToMinutes(prayer.time);
      
      if (!nextPrayerFound && prayerMinutes > currentTime) {
        prayer.isNext = true;
        nextPrayerFound = true;
      } else if (prayerMinutes <= currentTime) {
        prayer.isPassed = true;
      }
    });

    // Special handling: Only mark Subuh as next after midnight (00:00)
    // During Isya time (before midnight), no next prayer should be highlighted
    if (!nextPrayerFound) {
      if (currentHour >= 0 && currentHour < 6) {
        // It's after midnight (00:00-06:00), Subuh is legitimately next
        prayerTimes[0].isNext = true;
      }
      // If it's evening (after Isya, before midnight), don't highlight anything
      // This gives a natural pause before the next day's cycle begins
    }

    return prayerTimes;
  }

  /**
   * Format time string to remove seconds and timezone
   */
  private static formatTime(timeString: string): string {
    // Remove timezone info and seconds
    const time = timeString.split(' ')[0]; // Remove timezone
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  }

  /**
   * Convert time string to minutes from midnight
   */
  private static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Get default location (Jakarta, Indonesia)
   */
  static getDefaultLocation(): Coordinates {
    return {
      latitude: -6.2088,  // Jakarta
      longitude: 106.8456
    };
  }

  /**
   * Get prayer times for current location or default location
   */
  static async getPrayerTimesForCurrentLocation(): Promise<SimplePrayerTime[]> {
    try {
      let coordinates: Coordinates;
      
      try {
        coordinates = await this.getCurrentLocation();
      } catch (error) {
        console.warn('Could not get current location, using default (Jakarta):', error);
        coordinates = this.getDefaultLocation();
      }

      const response = await this.getPrayerTimes({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        method: 20, // Institute of Geophysics, University of Tehran
        school: 0,  // Shafi school
      });

      return this.formatPrayerTimesForDisplay(response);
    } catch (error) {
      console.error('Error getting prayer times:', error);
      throw error;
    }
  }
}