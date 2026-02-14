"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"

const errorMessages = {
  Configuration: "Terjadi kesalahan konfigurasi pada server.",
  AccessDenied: "Akses ditolak. Anda tidak memiliki izin untuk masuk.",
  Verification: "Token verifikasi tidak valid atau sudah kedaluwarsa.",
  Default: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi."
}

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams?.get("error")
  
  const errorMessage = error && error in errorMessages 
    ? errorMessages[error as keyof typeof errorMessages]
    : errorMessages.Default

  return (
    <div className="min-h-screen bg-linear-to-br from-midnight-blue via-midnight-blue/90 to-sage-green flex items-center justify-center px-4">
      <div className="bg-warm-cream rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-xl font-bold text-midnight-blue mb-2">
          Gagal Masuk
        </h1>
        <p className="text-midnight-blue/70 mb-8">
          {errorMessage}
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="w-full bg-midnight-blue text-warm-cream py-3 px-4 rounded-lg hover:bg-midnight-blue/90 transition-colors duration-200 block"
          >
            Coba Lagi
          </Link>
          <Link
            href="/"
            className="w-full bg-transparent border border-midnight-blue text-midnight-blue py-3 px-4 rounded-lg hover:bg-midnight-blue/5 transition-colors duration-200 block"
          >
            Kembali ke Beranda
          </Link>
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-6 p-3 bg-gray-100 rounded-lg text-left">
            <p className="text-xs text-gray-600 font-mono">
              Error: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}