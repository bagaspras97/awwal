"use client"

import { useSession } from "next-auth/react"
import { useAttendance } from "./useAttendance"
import { PrayerName } from "../types/prayer"
import { useCallback, useState } from "react"
import { useAttendanceRefresh } from "../contexts/AttendanceContext"

/**
 * Hook untuk menangani attendance yang terintegrasi dengan authentication
 * Jika user login, data akan disimpan dengan user ID untuk isolasi data
 * Jika user tidak login, data tetap disimpan di localStorage tanpa user ID
 */
export function useUserAttendance() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { forceRefresh } = useAttendanceRefresh()
  
  // Generate storage key berdasarkan user login status
  const getStorageKey = (baseKey: string) => {
    return userId ? `${baseKey}_user_${userId}` : baseKey
  }
  
  // Use existing attendance hook with user-specific storage key
  const attendanceHook = useAttendance()
  
  const markPrayerCompleted = useCallback((prayerName: PrayerName) => {
    const storageKey = getStorageKey('prayerAttendance')
    const today = new Date().toISOString().split('T')[0]
    
    // Get existing data
    const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}')
    
    // Update attendance
    if (!existingData[today]) {
      existingData[today] = {}
    }
    
    existingData[today][prayerName] = {
      completed: true,
      completedAt: new Date().toISOString(),
      method: 'simple'
    }
    
    // Save to user-specific storage
    localStorage.setItem(storageKey, JSON.stringify(existingData))
    
    // Trigger re-render with custom event
    window.dispatchEvent(new CustomEvent('attendanceUpdate', { detail: { prayerName, action: 'completed' } }))
    
    // Force local refresh
    setRefreshTrigger(prev => prev + 1)
    forceRefresh()
  }, [userId, forceRefresh])
  
  const markPrayerAttendedWithCustomTime = useCallback((prayerName: PrayerName, customTime: string) => {
    const storageKey = getStorageKey('prayerAttendance')
    const today = new Date().toISOString().split('T')[0]
    
    // Get existing data
    const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}')
    
    // Update attendance
    if (!existingData[today]) {
      existingData[today] = {}
    }
    
    existingData[today][prayerName] = {
      completed: true,
      completedAt: new Date().toISOString(),
      customTime,
      method: 'detailed'
    }
    
    // Save to user-specific storage
    localStorage.setItem(storageKey, JSON.stringify(existingData))
    
    // Trigger re-render with custom event
    window.dispatchEvent(new CustomEvent('attendanceUpdate', { detail: { prayerName, action: 'attendedWithTime', customTime } }))
    
    // Force local refresh
    setRefreshTrigger(prev => prev + 1)
    forceRefresh()
  }, [userId, forceRefresh])
  
  const unmarkPrayer = useCallback((prayerName: PrayerName) => {
    const storageKey = getStorageKey('prayerAttendance')
    const today = new Date().toISOString().split('T')[0]
    
    // Get existing data
    const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}')
    
    // Remove attendance
    if (existingData[today] && existingData[today][prayerName]) {
      delete existingData[today][prayerName]
      
      // Remove day if no prayers left
      if (Object.keys(existingData[today]).length === 0) {
        delete existingData[today]
      }
    }
    
    // Save to user-specific storage
    localStorage.setItem(storageKey, JSON.stringify(existingData))
    
    // Trigger re-render with custom event
    window.dispatchEvent(new CustomEvent('attendanceUpdate', { detail: { prayerName, action: 'unmarked' } }))
    
    // Force local refresh
    setRefreshTrigger(prev => prev + 1)
    forceRefresh()
  }, [userId, forceRefresh])

  const getPrayerAttendance = useCallback((prayerName: PrayerName, date?: string) => {
    const storageKey = getStorageKey('prayerAttendance')
    const targetDate = date || new Date().toISOString().split('T')[0]
    
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}')
    return data[targetDate]?.[prayerName] || null
  }, [userId, refreshTrigger])
  
  const getAttendanceStats = useCallback(() => {
    const storageKey = getStorageKey('prayerAttendance')
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}')
    
    let totalDays = 0
    let totalPrayers = 0
    let completedPrayers = 0
    
    Object.keys(data).forEach(date => {
      const dayData = data[date]
      totalDays++
      
      Object.keys(dayData).forEach(prayer => {
        totalPrayers++
        if (dayData[prayer].completed) {
          completedPrayers++
        }
      })
    })
    
    const completionRate = totalPrayers > 0 ? (completedPrayers / totalPrayers) * 100 : 0
    
    return {
      totalDays,
      totalPrayers,
      completedPrayers,
      completionRate: Math.round(completionRate)
    }
  }, [userId, refreshTrigger])
  
  return {
    markPrayerCompleted,
    markPrayerAttendedWithCustomTime,
    unmarkPrayer,
    getPrayerAttendance,
    getAttendanceStats,
    isAuthenticated: !!session,
    user: session?.user || null
  }
}