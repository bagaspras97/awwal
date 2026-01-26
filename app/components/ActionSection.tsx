'use client';

import { useNextPrayer } from "@/app/hooks/usePrayerTimes";
import { useAttendance, useAttendanceStats } from "@/app/hooks/useAttendance";
import { useRealTimeStatus } from "@/app/hooks/useRealTimeStatus";
import { formatDateToIndonesian, getCurrentActivePrayer } from "@/app/utils/time";

export default function ActionSection() {
  const { nextPrayer, allPrayers } = useNextPrayer();
  const { todayAttendance } = useAttendance();
  const stats = useAttendanceStats(7);
  
  // Count completed prayers today from attendance data
  const attendedPrayersToday = todayAttendance 
    ? Object.values(todayAttendance.prayers).filter(prayer => prayer.isAttended).length 
    : 0;

  // Count early prayers today
  const earlyPrayersToday = todayAttendance 
    ? Object.values(todayAttendance.prayers).filter(prayer => 
        prayer.isAttended && prayer.isEarly === true
      ).length 
    : 0;

  // Get active prayer
  const activePrayer = allPrayers ? getCurrentActivePrayer(allPrayers) : null;
  
  // Get status message
  const getStatusMessage = () => {
    if (!allPrayers) return "Menentukan status shalat...";
    
    if (attendedPrayersToday === 0) {
      return "Mari mulai hari dengan shalat di awal waktu.";
    }
    
    if (attendedPrayersToday === 5) {
      const earlyMessage = earlyPrayersToday > 0 ? ` ${earlyPrayersToday} di awal waktu.` : '.';
      return `Alhamdulillah, semua shalat hari ini telah terlaksana${earlyMessage}`;
    }
    
    const baseMessage = `Alhamdulillah, ${attendedPrayersToday} shalat hari ini sudah terlaksana`;
    const earlyMessage = earlyPrayersToday > 0 ? `, ${earlyPrayersToday} di awal waktu` : '';
    return `${baseMessage}${earlyMessage}.`;
  };

  const getButtonText = () => {
    if (activePrayer) {
      return `Absen ${activePrayer.name}`;
    }
    if (nextPrayer) {
      return `Persiapan ${nextPrayer.name}`;
    }
    return "Mari jaga shalat di awal waktu";
  };

  const statusMessage = getStatusMessage();
  const currentDate = formatDateToIndonesian();

  return (
    <section className="text-center">
      <button className="w-full py-4 rounded-xl bg-midnight-blue text-warm-cream font-medium text-lg hover:opacity-90 transition-opacity">
        {getButtonText()}
      </button>
      
      <div className="mt-4 space-y-2">
        {/* Prayer Status */}
        <p className="text-xs text-midnight-blue/50">
          {statusMessage}
        </p>
        
        {/* Today's Progress */}
        {attendedPrayersToday > 0 && (
          <div className="flex items-center justify-center space-x-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i <= attendedPrayersToday 
                      ? 'bg-sage-green' 
                      : 'bg-midnight-blue/20'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-sage-green font-medium">
              {attendedPrayersToday}/5
            </span>
          </div>
        )}
        
        {/* Weekly Stats */}
        {stats.totalPrayers > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-midnight-blue/30">
              7 hari: {Math.round(stats.attendanceRate)}% konsisten • {Math.round(stats.earlyRate)}% tepat waktu
            </p>
            {stats.averageDelayMinutes > 0 && (
              <p className="text-xs text-soft-gold/60">
                Rata-rata terlambat: {stats.averageDelayMinutes} menit
              </p>
            )}
          </div>
        )}
        
        <p className="text-xs text-midnight-blue/30">
          {currentDate}
        </p>
      </div>
    </section>
  );
}