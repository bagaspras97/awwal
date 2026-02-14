"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const session = await getSession()
      if (session) {
        router.push('/')
      }
    }
    checkAuth()
  }, [router])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch (error) {
      console.error('Sign in error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-midnight-blue via-midnight-blue/90 to-sage-green flex items-center justify-center px-4">
      <div className="bg-warm-cream rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-midnight-blue rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-warm-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-midnight-blue mb-2">Masuk ke Awwal</h1>
          <p className="text-midnight-blue/70 text-sm leading-relaxed">
            Masuk untuk melacak ibadah shalat Anda dan<br />
            membangun kebiasaan yang konsisten
          </p>
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white border border-gray-300 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
              <span>Menghubungkan...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Masuk dengan Google</span>
            </>
          )}
        </button>

        {/* Info */}
        <div className="mt-8 space-y-4">
          <p className="text-xs text-midnight-blue/60 text-center">
            Dengan masuk, Anda setuju untuk menyimpan data ibadah secara aman
          </p>
          
          <div className="bg-sage-green/10 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-sage-green mb-2">Keunggulan Login:</h3>
            <ul className="space-y-1 text-xs text-midnight-blue/70">
              <li>✓ Simpan riwayat shalat secara permanen</li>
              <li>✓ Akses data dari perangkat mana saja</li>
              <li>✓ Analisis statistik ibadah personal</li>
              <li>✓ Data aman dengan enkripsi Google</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}