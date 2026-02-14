"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

interface AttendanceContextType {
  refreshTrigger: number
  forceRefresh: () => void
}

const AttendanceContext = createContext<AttendanceContextType>({
  refreshTrigger: 0,
  forceRefresh: () => {}
})

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  const forceRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])
  
  return (
    <AttendanceContext.Provider value={{ refreshTrigger, forceRefresh }}>
      {children}
    </AttendanceContext.Provider>
  )
}

export function useAttendanceRefresh() {
  return useContext(AttendanceContext)
}