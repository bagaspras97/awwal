import { Coordinates } from '@/app/types/prayer';

export interface LocationInfo {
  city: string;
  state?: string;
  country: string;
  coordinates: Coordinates;
  displayName: string;
}

export class LocationService {
  // Simple delay function
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get location info using reverse geocoding with multiple APIs
   */
  static async getLocationInfo(coordinates: Coordinates): Promise<LocationInfo> {
    // Try BigDataCloud first (more reliable, no API key needed)
    try {
      await this.delay(300); // Small delay
      
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&localityLanguage=id`
      );

      console.log('BigDataCloud response:', {response})

      if (response.ok) {
        const data = await response.json();
        console.log('BigDataCloud data:', {data})
        
        // Extract location from BigDataCloud
        const city = data.city || data.locality || data.principalSubdivision || 'Lokasi Tidak Dikenal';
        const state = data.principalSubdivision || data.principalSubdivisionCode;
        const country = data.countryName || 'Indonesia';

        return {
          city,
          state,
          country,
          coordinates,
          displayName: city
        };
      }
    } catch (error) {
      console.error('BigDataCloud API error:', error);
    }

    // Fallback to Nominatim
    try {
      await this.delay(500);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&accept-language=id,en`,
        {
          headers: {
            'User-Agent': 'Awwal Prayer Times App (awwal.app)',
            'Referer': 'https://awwal.app',
            'Accept': 'application/json',
          },
        }
      );

      console.log('Nominatim response:', {response})

      if (response.ok) {
        const data = await response.json();
        console.log('Nominatim data:', {data})
        
        // Extract location components
        const address = data.address || {};
        const city = address.city || address.town || address.village || address.suburb || 'Lokasi Tidak Dikenal';
        const state = address.state || address.province;
        const country = address.country || 'Indonesia';

        let displayName = city;
        if (state && state !== city) {
          displayName += `, ${state}`;
        }

        return {
          city,
          state,
          country,
          coordinates,
          displayName
        };
      }
    } catch (error) {
      console.error('Nominatim API error:', error);
    }

    // Fallback to geocode.xyz (another free API)
    try {
      await this.delay(700);
      
      const response = await fetch(
        `https://geocode.xyz/${coordinates.latitude},${coordinates.longitude}?json=1&auth=public`
      );

      console.log('Geocode.xyz response:', {response})

      if (response.ok) {
        const data = await response.json();
        console.log('Geocode.xyz data:', {data})
        
        if (data && !data.error) {
          const city = data.city || data.region || 'Lokasi Tidak Dikenal';
          const state = data.state || data.prov;
          const country = data.country || 'Indonesia';

          let displayName = city;
          if (state && state !== city) {
            displayName += `, ${state}`;
          }

          return {
            city,
            state,
            country,
            coordinates,
            displayName
          };
        }
      }
    } catch (error) {
      console.error('Geocode.xyz API error:', error);
    }

    // Fallback to coordinate-based estimation
    try {
      return await this.getLocationByCoordinatesEstimation(coordinates);
    } catch (fallbackError) {
      console.error('Coordinate estimation failed:', fallbackError);
      
      // Final fallback
      return {
        city: 'Lokasi Tidak Dikenal',
        country: 'Indonesia',
        coordinates,
        displayName: `${coordinates.latitude.toFixed(3)}, ${coordinates.longitude.toFixed(3)}`
      };
    }
  }

  /**
   * Extended location estimation based on coordinates (Indonesia-focused)
   */
  private static async getLocationByCoordinatesEstimation(coordinates: Coordinates): Promise<LocationInfo> {
    const { latitude, longitude } = coordinates;
    
    let city = 'Kota Tidak Dikenal';
    let state = 'Indonesia';
    
    // Jakarta area (expanded)
    if (latitude >= -6.5 && latitude <= -5.9 && longitude >= 106.5 && longitude <= 107.2) {
      city = 'Jakarta';
      state = 'DKI Jakarta';
    }
    // Surabaya area
    else if (latitude >= -7.5 && latitude <= -7.0 && longitude >= 112.5 && longitude <= 113.0) {
      city = 'Surabaya';
      state = 'Jawa Timur';
    }
    // Bandung area
    else if (latitude >= -7.1 && latitude <= -6.7 && longitude >= 107.4 && longitude <= 107.8) {
      city = 'Bandung';
      state = 'Jawa Barat';
    }
    // Medan area
    else if (latitude >= 3.3 && latitude <= 3.8 && longitude >= 98.4 && longitude <= 98.9) {
      city = 'Medan';
      state = 'Sumatera Utara';
    }
    // Yogyakarta area
    else if (latitude >= -8.1 && latitude <= -7.6 && longitude >= 110.2 && longitude <= 110.6) {
      city = 'Yogyakarta';
      state = 'D.I. Yogyakarta';
    }
    // Semarang area
    else if (latitude >= -7.1 && latitude <= -6.9 && longitude >= 110.3 && longitude <= 110.5) {
      city = 'Semarang';
      state = 'Jawa Tengah';
    }
    // Makassar area
    else if (latitude >= -5.3 && latitude <= -5.0 && longitude >= 119.3 && longitude <= 119.5) {
      city = 'Makassar';
      state = 'Sulawesi Selatan';
    }
    // Denpasar/Bali area
    else if (latitude >= -8.8 && latitude <= -8.5 && longitude >= 115.1 && longitude <= 115.3) {
      city = 'Denpasar';
      state = 'Bali';
    }
    // Palembang area
    else if (latitude >= -3.1 && latitude <= -2.8 && longitude >= 104.6 && longitude <= 104.9) {
      city = 'Palembang';
      state = 'Sumatera Selatan';
    }
    // Pekanbaru area
    else if (latitude >= 0.4 && latitude <= 0.7 && longitude >= 101.3 && longitude <= 101.5) {
      city = 'Pekanbaru';
      state = 'Riau';
    }
    // Malang area
    else if (latitude >= -8.0 && latitude <= -7.8 && longitude >= 112.6 && longitude <= 112.7) {
      city = 'Malang';
      state = 'Jawa Timur';
    }
    // Bogor area
    else if (latitude >= -6.7 && latitude <= -6.5 && longitude >= 106.7 && longitude <= 106.9) {
      city = 'Bogor';
      state = 'Jawa Barat';
    }
    // Tangerang area
    else if (latitude >= -6.3 && latitude <= -6.1 && longitude >= 106.6 && longitude <= 106.8) {
      city = 'Tangerang';
      state = 'Banten';
    }
    // Bekasi area
    else if (latitude >= -6.3 && latitude <= -6.1 && longitude >= 106.9 && longitude <= 107.1) {
      city = 'Bekasi';
      state = 'Jawa Barat';
    }
    // Depok area
    else if (latitude >= -6.5 && latitude <= -6.3 && longitude >= 106.7 && longitude <= 106.9) {
      city = 'Depok';
      state = 'Jawa Barat';
    }
    // Regional fallbacks by province
    else if (latitude >= -11 && latitude <= 6 && longitude >= 95 && longitude <= 141) {
      // Inside Indonesia bounds
      if (longitude <= 105) {
        city = 'Sumatera';
        state = 'Sumatera';
      } else if (longitude <= 115 && latitude >= -9) {
        city = 'Jawa';
        state = 'Jawa';
      } else if (longitude <= 125) {
        city = 'Sulawesi';
        state = 'Sulawesi';
      } else {
        city = 'Indonesia Timur';
        state = 'Indonesia';
      }
    }
    
    const displayName = state && state !== city ? `${city}, ${state}` : city;
    
    return {
      city,
      state,
      country: 'Indonesia',
      coordinates,
      displayName
    };
  }

  /**
   * Get current location with city info
   */
  static async getCurrentLocationInfo(): Promise<LocationInfo> {
    try {
      // Get coordinates first
      const coordinates = await new Promise<Coordinates>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => reject(error),
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      });

      // Get location info
      return await this.getLocationInfo(coordinates);

    } catch (error) {
      console.error('Error getting current location info:', error);
      
      // Return Jakarta as fallback
      const jakartaCoords = { latitude: -6.2088, longitude: 106.8456 };
      return {
        city: 'Jakarta',
        state: 'DKI Jakarta',
        country: 'Indonesia',
        coordinates: jakartaCoords,
        displayName: 'Jakarta, DKI Jakarta'
      };
    }
  }

  /**
   * Format coordinates for display
   */
  static formatCoordinates(coordinates: Coordinates): string {
    return `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`;
  }

  /**
   * Get timezone from coordinates (basic estimation)
   */
  static getTimezoneFromCoordinates(coordinates: Coordinates): string {
    // Basic timezone detection for Indonesia
    if (coordinates.longitude >= 95 && coordinates.longitude <= 141 && 
        coordinates.latitude >= -11 && coordinates.latitude <= 6) {
      
      if (coordinates.longitude <= 105) return 'WIB'; // Western Indonesia Time
      if (coordinates.longitude <= 120) return 'WITA'; // Central Indonesia Time
      return 'WIT'; // Eastern Indonesia Time
    }
    
    return 'WIB'; // Default fallback
  }
}