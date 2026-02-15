"use client"

import { useSession } from "next-auth/react"
import { useUserAttendance } from "../hooks/useUserAttendance"
import { Calendar, Target, TrendingUp, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useAttendanceRefresh } from "../contexts/AttendanceContext"

export default function UserStats() {
  const { data: session } = useSession()
  const { getAttendanceStats, isAuthenticated, syncStatus } = useUserAttendance()
  const { refreshTrigger } = useAttendanceRefresh()
  const [stats, setStats] = useState({
    totalDays: 0,
    totalPrayers: 0,
    completedPrayers: 0,
    completionRate: 0
  })

  useEffect(() => {
    const updateStats = async () => {
      const currentStats = await getAttendanceStats()
      console.log('UserStats - Updated stats:', currentStats)
      setStats(currentStats)
    }

    // Initial load
    updateStats()

    // Listen for attendance changes
    const handleAttendanceUpdate = () => {
      updateStats()
    }

    globalThis.window.addEventListener('attendanceUpdate', handleAttendanceUpdate)
    // Keep storage listener for backward compatibility
    globalThis.window.addEventListener('storage', handleAttendanceUpdate)
    
    return () => {
      globalThis.window.removeEventListener('attendanceUpdate', handleAttendanceUpdate)
      globalThis.window.removeEventListener('storage', handleAttendanceUpdate)
    }
  }, [getAttendanceStats, refreshTrigger])

  // Don't show stats if not authenticated, but show if totalPrayers is 0 (user can still see empty state)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-sage-green/20 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-midnight-blue flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-sage-green" />
          Statistik Ibadah
        </h3>
        {isAuthenticated && (
          <div className="flex items-center gap-2 text-midnight-blue/60 text-sm">
            <User className="w-4 h-4" />
            <span>{session?.user?.name?.split(' ')[0]}</span>
            {/* Sync Status Indicator */}
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced' ? 'bg-sage-green' :
                syncStatus === 'syncing' ? 'bg-soft-gold animate-pulse' :
                syncStatus === 'pending' ? 'bg-orange-400' :
                'bg-gray-400'
              }`}></div>
              <span className="text-xs">
                {syncStatus === 'synced' && 'Tersinkron'}
                {syncStatus === 'syncing' && 'Sinkronisasi...'}
                {syncStatus === 'pending' && 'Menunggu sinkron'}
                {syncStatus === 'offline' && 'Offline'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion Rate */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${
            stats.completionRate >= 80 ? 'text-sage-green' :
            stats.completionRate >= 60 ? 'text-soft-gold' :
            'text-red-500'
          }`}>
            {stats.completionRate}%
          </div>
          <div className="text-xs text-midnight-blue/60">
            Tingkat Kepatuhan
          </div>
        </div>

        {/* Total Days */}
        <div className="text-center">
          <div className="text-2xl font-bold text-midnight-blue">
            {stats.totalDays}
          </div>
          <div className="text-xs text-midnight-blue/60 flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3" />
            Hari Tracked
          </div>
        </div>

        {/* Completed Prayers */}
        <div className="text-center">
          <div className="text-2xl font-bold text-sage-green">
            {stats.completedPrayers}
          </div>
          <div className="text-xs text-midnight-blue/60">
            Shalat Selesai
          </div>
        </div>

        {/* Total Prayers */}
        <div className="text-center">
          <div className="text-2xl font-bold text-midnight-blue/70">
            {stats.totalPrayers}
          </div>
          <div className="text-xs text-midnight-blue/60 flex items-center justify-center gap-1">
            <Target className="w-3 h-3" />
            Total Shalat
          </div>
        </div>
      </div>

      {/* Empty State Message */}
      {stats.totalPrayers === 0 && (
        <div className="mt-4 p-4 bg-sage-green/5 rounded-lg text-center">
          <p className="text-sm text-midnight-blue/70 mb-2">
            Belum ada data shalat tercatat
          </p>
          <p className="text-xs text-midnight-blue/50">
            Mulai track shalat Anda dengan klik tombol "Hadir" pada waktu shalat
          </p>
        </div>
      )}

      {/* Progress Bar - only show if there's data */}
      {stats.totalPrayers > 0 && (
        <div className="mt-4">
          <div className="bg-gray-100 rounded-full h-2">
            <div 
              className="bg-linear-to-r from-sage-green to-soft-gold h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Motivational Message - only show if there's data */}
      {stats.totalPrayers > 0 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-midnight-blue/60">
            {stats.completionRate >= 90 && "Mashaa Allah! Pertahankan konsistensi yang luar biasa! 🌟"}
            {stats.completionRate >= 80 && stats.completionRate < 90 && "Sangat baik! Terus tingkatkan ibadah Anda 💪"}
            {stats.completionRate >= 60 && stats.completionRate < 80 && "Bagus! Mari lebih konsisten lagi 📈"}
            {stats.completionRate < 60 && "Yuk semangat! Setiap langkah kecil sangat berarti 🌱"}
          </p>
        </div>
      )}

      {!isAuthenticated && (
        <div className="mt-4 p-3 bg-soft-gold/10 rounded-lg">
          <p className="text-xs text-midnight-blue/70 text-center">
            💡 Masuk dengan Google untuk menyimpan data secara permanen dan akses dari perangkat lain
          </p>
        </div>
      )}
    </div>
  )
}