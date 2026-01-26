'use client';

import { Loader2, Wifi } from "lucide-react";
import { usePrayerTimes } from "@/app/hooks/usePrayerTimes";
import { getCurrentActivePrayer } from "@/app/utils/time";
import { useRealTimeStatus } from "@/app/hooks/useRealTimeStatus";
import PrayerTimeCard from "./PrayerTimeCard";
import PrayerTimesHeader from "./PrayerTimesHeader";

export default function PrayerTimesList() {
  const { data: prayerTimes, isLoading, error, refetch } = usePrayerTimes();

// Get current prayer status and active prayer
  const statusMessage = useRealTimeStatus(prayerTimes || []);
  const activePrayer = prayerTimes ? getCurrentActivePrayer(prayerTimes) : null;

  // Loading state
  if (isLoading) {
    return (
      <section className="mb-12">
        <PrayerTimesHeader />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-sage-green animate-spin mx-auto mb-3" />
            <p className="text-sm text-midnight-blue/60">
              Menentukan waktu shalat...
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="mb-12">
        <PrayerTimesHeader />
        <div className="text-center py-8">
          <Wifi className="w-8 h-8 text-midnight-blue/40 mx-auto mb-3" />
          <p className="text-sm text-midnight-blue/60 mb-4">
            Tidak dapat memuat jadwal shalat
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-sage-green/10 text-sage-green rounded-lg text-sm font-medium hover:bg-sage-green/20 transition-colors"
          >
            Coba lagi
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <PrayerTimesHeader />
      <div className="space-y-3">
        {prayerTimes?.map((prayer) => (
          <PrayerTimeCard
            key={prayer.name}
            name={prayer.name}
            time={prayer.time}
            isNext={prayer.isNext}
            isPassed={prayer.isPassed}
            isActive={activePrayer?.name === prayer.name}
            allPrayerTimes={prayerTimes}
          />
        ))}
      </div>
      <div className="text-center mt-6">
        {/* Prayer Status */}
        <p className="text-sm text-midnight-blue/60">
          {statusMessage}
        </p>
        {activePrayer && (
          <p className="text-xs text-soft-gold font-medium mt-1">
            Waktu {activePrayer.name} sedang berlangsung
          </p>
        )}
      </div>
    </section>
  );
}