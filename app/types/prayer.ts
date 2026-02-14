// Nama-nama shalat utama
export type PrayerName =
  | "Fajr"      // Subuh
  | "Dhuhr"     // Dzuhur
  | "Asr"       // Ashar
  | "Maghrib"   // Maghrib
  | "Isha";     // Isya

// Types for Aladhan Prayer Times API Response
export interface PrayerTimings {
  Fajr: string;      // Subuh
  Sunrise: string;   // Syuruk
  Dhuhr: string;     // Dzuhur  
  Asr: string;       // Ashar
  Sunset: string;    // Maghrib (sunset time)
  Maghrib: string;   // Maghrib (prayer time)
  Isha: string;      // Isya
  Imsak: string;     // Imsak
  Midnight: string;  // Tengah malam
  Firstthird: string;
  Lastthird: string;
}

export interface DateInfo {
  readable: string;
  timestamp: string;
  hijri: {
    date: string;
    format: string;
    day: string;
    weekday: {
      en: string;
      ar: string;
    };
    month: {
      number: number;
      en: string;
      ar: string;
    };
    year: string;
    designation: {
      abbreviated: string;
      expanded: string;
    };
    holidays: string[];
  };
  gregorian: {
    date: string;
    format: string;
    day: string;
    weekday: {
      en: string;
    };
    month: {
      number: number;
      en: string;
    };
    year: string;
    designation: {
      abbreviated: string;
      expanded: string;
    };
  };
}

export interface Meta {
  latitude: number;
  longitude: number;
  timezone: string;
  method: {
    id: number;
    name: string;
    params: {
      Fajr: number;
      Isha: number;
    };
    location: {
      latitude: number;
      longitude: number;
    };
  };
  latitudeAdjustmentMethod: string;
  midnightMode: string;
  school: string;
  offset: Record<string, number>;
}

export interface PrayerTimesData {
  timings: PrayerTimings;
  date: DateInfo;
  meta: Meta;
}

export interface PrayerTimesApiResponse {
  code: number;
  status: string;
  data: PrayerTimesData;
}

// Simplified prayer time for display
export interface SimplePrayerTime {
  name: string;
  nameArabic: string;
  time: string;
  isNext?: boolean;
  isPassed?: boolean;
}

// Location coordinates
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// API request parameters
export interface PrayerTimesParams {
  latitude: number;
  longitude: number;
  method?: number; // Calculation method (default: 20 for Institute of Geophysics, University of Tehran)
  school?: number; // Juristic school (0: Shafi, 1: Hanafi)
  date?: string;   // Date in DD-MM-YYYY format
}