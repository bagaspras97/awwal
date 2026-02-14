'use client';

import { useState, useEffect } from 'react';
import { LucideIcon, Check, Clock, Edit3, X, Sun, Sunrise, Sunset, Moon, Star } from "lucide-react";
import { useUserAttendance } from "@/app/hooks/useUserAttendance";
import { getValidPrayerTimeRange } from "@/app/utils/time";
import { SimplePrayerTime } from "@/app/types/prayer";
import { useAttendanceRefresh } from "@/app/contexts/AttendanceContext";

interface PrayerTimeCardProps {
  name: string;
  time: string;
  isNext?: boolean;
  isPassed?: boolean;
  isActive?: boolean; // Currently active prayer time
  allPrayerTimes?: SimplePrayerTime[]; // For validation
}

// Get more descriptive icons for each prayer time
const getPrayerIcon = (prayerName: string) => {
  switch (prayerName.toLowerCase()) {
    case 'subuh':
      return { icon: Sunrise, color: 'text-orange-400' };
    case 'dzuhur':
      return { icon: Sun, color: 'text-yellow-500' };
    case 'ashar':
      return { icon: Sun, color: 'text-orange-500' };
    case 'maghrib':
      return { icon: Sunset, color: 'text-red-400' };
    case 'isya':
      return { icon: Moon, color: 'text-indigo-400' };
    default:
      return { icon: Star, color: 'text-gray-400' };
  }
};

export default function PrayerTimeCard({ 
  name, 
  time, 
  isNext = false, 
  isPassed = false,
  isActive = false,
  allPrayerTimes = []
}: PrayerTimeCardProps) {
  const { 
    getPrayerAttendance,
    markPrayerCompleted,
    markPrayerAttendedWithCustomTime,
    unmarkPrayer,
    isAuthenticated
  } = useUserAttendance();
  const { refreshTrigger } = useAttendanceRefresh();
  const [isEditing, setIsEditing] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [localAttendance, setLocalAttendance] = useState<any>(null);
  
  // Get attendance data with local state priority
  const attendanceData = localAttendance || getPrayerAttendance(name);
  const isAttended = !!attendanceData?.completed;
  
  // Listen for attendance updates
  useEffect(() => {
    const handleAttendanceUpdate = (event: any) => {
      if (event.detail?.prayerName === name) {
        // Refresh local data immediately
        setLocalAttendance(getPrayerAttendance(name));
      }
    };
    
    window.addEventListener('attendanceUpdate', handleAttendanceUpdate);
    return () => window.removeEventListener('attendanceUpdate', handleAttendanceUpdate);
  }, [name, getPrayerAttendance]);
  
  // Initial load and refresh on context changes
  useEffect(() => {
    setLocalAttendance(getPrayerAttendance(name));
  }, [name, getPrayerAttendance, refreshTrigger]);
  const { icon: Icon, color: iconColor } = getPrayerIcon(name);
  
  // Get valid time range for this prayer
  const validRange = getValidPrayerTimeRange(name, allPrayerTimes);
  
  const handleMarkAttended = async () => {
    try {
      markPrayerCompleted(name);
      // Immediate local update
      setLocalAttendance({
        completed: true,
        completedAt: new Date().toISOString(),
        method: 'simple'
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const handleQuickToggle = async () => {
    try {
      if (isAttended) {
        unmarkPrayer(name);
        // Immediate local update
        setLocalAttendance(null);
      } else {
        markPrayerCompleted(name);
        // Immediate local update
        setLocalAttendance({
          completed: true,
          completedAt: new Date().toISOString(),
          method: 'simple'
        });
      }
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  };

  const handleEditStart = () => {
    // Pre-fill with current attended time if available, otherwise scheduled time
    const currentAttendedTime = attendanceData?.customTime || time;
    setCustomTime(currentAttendedTime);
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    try {
      markPrayerAttendedWithCustomTime(name, customTime);
      // Immediate local update
      setLocalAttendance({
        completed: true,
        completedAt: new Date().toISOString(),
        customTime,
        method: 'detailed'
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving custom time:', error);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setCustomTime('');
  };

  return (
    <div 
      className={`
        p-4 rounded-xl border transition-all duration-300 
        ${isActive
          ? 'bg-soft-gold/10 border-soft-gold/30 ring-1 ring-soft-gold/20'
          : isNext 
            ? 'bg-sage-green/10 border-sage-green/30 ring-1 ring-sage-green/20' 
            : isAttended
              ? 'bg-sage-green/5 border-sage-green/20'
              : isPassed
                ? 'bg-gray-50/60 border-gray-200/60'
                : 'bg-white border-gray-100 hover:border-gray-200'
        }
      `}
    >
      <div className="flex items-center justify-between">
        {/* Left: Icon + Prayer Info */}
        <div className="flex items-center space-x-3">
          {/* Prayer Icon */}
          <div className={`w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center shadow-sm ${
            isActive ? 'ring-1 ring-soft-gold/20' :
            isNext ? 'ring-1 ring-sage-green/20' : ''
          }`}>
            <Icon 
              className={`w-5 h-5 ${
                isActive ? 'text-soft-gold' :
                isNext ? 'text-sage-green' :
                isAttended ? 'text-sage-green/80' :
                iconColor
              }`} 
            />
          </div>
          
          {/* Prayer Name + Status */}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`font-semibold ${
                isActive || isNext ? 'text-midnight-blue' :
                'text-midnight-blue/80'
              }`}>
                {name}
              </h3>
              
              {/* Simple Status Indicators */}
              {isActive && !isAttended && (
                <span className="text-xs bg-soft-gold/20 text-soft-gold px-2 py-1 rounded-full">
                  Aktif
                </span>
              )}
              {isNext && !isActive && (
                <span className="text-xs bg-sage-green/20 text-sage-green px-2 py-1 rounded-full">
                  Berikutnya
                </span>
              )}
              {isAttended && (
                <span className="text-xs bg-sage-green/20 text-sage-green px-2 py-1 rounded-full">
                  Selesai
                </span>
              )}
            </div>
            
            {/* Simple Timing Info for Attended */}
            {isAuthenticated && isAttended && attendanceData?.customTime && (
              <div className="text-xs text-midnight-blue/60 mt-1">
                <span>Shalat {attendanceData.customTime}</span>
                {/* Additional timing analysis could be added here */}
              </div>
            )}
          </div>
        </div>
        
        {/* Right: Time + Actions */}
        <div className="flex items-center space-x-3">
          {/* Prayer Time */}
          <span className={`text-xl font-serif font-bold ${
            isActive || isNext ? 'text-midnight-blue' : 'text-midnight-blue/70'
          }`}>
            {time}
          </span>
          
          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Active Prayer Button */}
            {isActive && !isAttended && (
              isAuthenticated ? (
                <button
                  onClick={handleMarkAttended}
                  className="px-3 py-1.5 bg-soft-gold text-midnight-blue text-sm font-medium rounded-lg hover:bg-soft-gold/80 transition-colors"
                >
                  Hadir
                </button>
              ) : (
                <div className="px-3 py-1.5 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed">
                  Login untuk tracking
                </div>
              )
            )}
            
            {/* Passed Prayer Actions */}
            {isPassed && !isActive && (
              <div className="flex items-center space-x-1">
                {!isAuthenticated ? (
                  <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                    <span className="text-xs text-gray-400">Login untuk tracking</span>
                  </div>
                ) : !isEditing ? (
                  <>
                    <button
                      onClick={handleQuickToggle}
                      className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                        isAttended 
                          ? 'text-sage-green hover:bg-sage-green/10' 
                          : 'text-gray-600 hover:text-sage-green hover:bg-sage-green/10'
                      }`}
                      title={isAttended ? "Belum Shalat" : "Sudah Shalat"}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={handleEditStart}
                      className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit waktu"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center space-x-1">
                    <input
                      type="time"
                      value={customTime}
                      min={validRange?.min}
                      max={validRange?.max}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sage-green"
                    />
                    <button
                      onClick={handleEditSave}
                      className="px-2 py-1 text-sage-green hover:bg-sage-green/10 rounded-md transition-colors"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="px-2 py-1 text-gray-400 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}