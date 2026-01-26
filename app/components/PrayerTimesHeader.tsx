'use client';

import { MapPin, Globe, Loader2 } from "lucide-react";
import { useLocationInfo } from "@/app/hooks/useLocationInfo";

export default function PrayerTimesHeader() {
  const { locationInfo, loading, error } = useLocationInfo();

  return (
    <div className="text-center mb-6">
      <h2 className="text-lg font-serif font-medium text-midnight-blue mb-2">
        Jadwal Shalat Hari Ini
      </h2>
      
      {/* Location Info - Compact */}
      <div className="flex items-center justify-center space-x-2">
        {loading ? (
          <>
            <Loader2 className="w-3 h-3 text-sage-green animate-spin" />
            <span className="text-xs text-midnight-blue/60">Mendeteksi lokasi...</span>
          </>
        ) : error ? (
          <>
            <Globe className="w-3 h-3 text-sage-green/70" />
            <span className="text-xs text-midnight-blue/60">Jakarta, Indonesia</span>
          </>
        ) : locationInfo ? (
          <>
            <MapPin className="w-3 h-3 text-sage-green" />
            <span className="text-xs text-sage-green font-medium">
              {locationInfo.displayName}
            </span>
          </>
        ) : (
          <>
            <Globe className="w-3 h-3 text-sage-green/70" />
            <span className="text-xs text-midnight-blue/60">Menentukan lokasi...</span>
          </>
        )}
      </div>
    </div>
  );
}