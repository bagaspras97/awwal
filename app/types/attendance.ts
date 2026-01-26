// Types for prayer attendance tracking
export interface PrayerAttendance {
  prayerName: string;
  date: string; // YYYY-MM-DD format
  scheduledTime: string; // HH:MM format - waktu jadwal shalat
  actualTime: string; // HH:MM format - waktu sebenarnya saat absen
  attendedAt: string; // ISO timestamp when marked as attended
  isAttended: boolean;
  isEarly?: boolean; // true jika shalat dilakukan di awal waktu
  delayMinutes?: number; // berapa menit terlambat dari jadwal (jika terlambat)
}

export interface DailyPrayerAttendance {
  date: string;
  prayers: {
    Subuh?: PrayerAttendance;
    Dzuhur?: PrayerAttendance;
    Ashar?: PrayerAttendance;
    Maghrib?: PrayerAttendance;
    Isya?: PrayerAttendance;
  };
}

export interface AttendanceStats {
  totalPrayers: number;
  attendedPrayers: number;
  attendanceRate: number;
  streak: number; // consecutive days with all prayers
}