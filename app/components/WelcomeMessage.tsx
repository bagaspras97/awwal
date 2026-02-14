"use client"

import { useSession } from "next-auth/react"
import { Clock, TrendingUp, Shield } from "lucide-react"

export default function WelcomeMessage() {
  const { data: session, status } = useSession()

  // Don't show anything while loading
  if (status === "loading") {
    return null
  }

  // Don't show welcome message for logged-in users
  if (session) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-sage-green/20 p-6 mb-6">
      {/* Welcome Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-midnight-blue mb-2">
          Selamat Datang di Awwal 👋
        </h2>
        <p className="text-midnight-blue/70 text-sm leading-relaxed">
          Teman pengingat shalat yang lembut untuk membantu Anda 
          <span className="font-semibold text-sage-green"> mendahulukan shalat di awal waktu</span>
        </p>
      </div>

      {/* Features Preview */}
      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-sage-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-sage-green" />
          </div>
          <div>
            <h3 className="font-medium text-midnight-blue text-sm">Waktu Shalat Real-time</h3>
            <p className="text-xs text-midnight-blue/60">Lihat jadwal shalat sesuai lokasi Anda</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-soft-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-soft-gold" />
          </div>
          <div>
            <h3 className="font-medium text-midnight-blue text-sm">Tracking Personal</h3>
            <p className="text-xs text-midnight-blue/60">Catat dan analisis kebiasaan shalat Anda</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h3 className="font-medium text-midnight-blue text-sm">Data Aman & Sinkron</h3>
            <p className="text-xs text-midnight-blue/60">Data tersimpan aman dan dapat diakses dari mana saja</p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-warm-cream/30 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 bg-soft-gold rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-midnight-blue">Mode Tamu</span>
        </div>
        <p className="text-xs text-midnight-blue/60">
          Anda dapat melihat waktu shalat. Login dengan Google untuk fitur tracking lengkap.
        </p>
      </div>
    </div>
  )
}