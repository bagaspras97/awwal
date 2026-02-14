"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { User, LogIn, LogOut, Shield } from "lucide-react"
import Image from "next/image"

export default function AuthButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 text-warm-cream/70">
        <div className="w-4 h-4 border-2 border-warm-cream/30 border-t-warm-cream/70 rounded-full animate-spin"></div>
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        {/* User Info */}
        <div className="flex items-center gap-2 bg-warm-cream/10 px-3 py-1.5 rounded-lg">
          <div className="w-7 h-7 bg-warm-cream/20 rounded-full flex items-center justify-center overflow-hidden">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={28}
                height={28}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-warm-cream" />
            )}
          </div>
          <span className="text-sm font-medium text-warm-cream hidden sm:block">
            {session.user?.name?.split(' ')[0] || 'User'}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            signOut({ callbackUrl: '/' })
          }}
          className="flex items-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium"
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      {/* Login prompt */}
      <div className="flex items-center gap-2 text-warm-cream/60 text-xs">
        <Shield className="w-4 h-4" />
        <span className="hidden sm:inline">Login untuk tracking personal</span>
      </div>
      
      {/* Login Button */}
      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className="flex items-center gap-2 bg-warm-cream text-midnight-blue px-4 py-2 rounded-lg hover:bg-warm-cream/90 hover:scale-105 transition-all duration-200 font-medium text-sm shadow-lg"
      >
        <LogIn className="w-4 h-4" />
        <span>Masuk dengan Google</span>
      </button>
    </div>
  )
}