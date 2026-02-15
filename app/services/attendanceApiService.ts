'use client';

import { AttendanceRecord } from '../types/attendance';
import { PrayerName } from '../types/prayer';

// API Data Types (matching backend schema)
interface ApiAttendanceData {
  prayerName: string;
  prayerDate: string;
  scheduledTime: string;
  customTime?: string;
  method: 'simple' | 'detailed';
}

interface ApiAttendanceResponse {
  attendances: {
    id: string;
    prayerName: string;
    prayerDate: string;
    scheduledTime: string;
    attendedAt: string;
    customTime?: string;
    isEarly?: boolean;
    delayMinutes?: number;
    method: string;
  }[];
}

// Data Converters
export const convertToApiFormat = (record: AttendanceRecord): ApiAttendanceData => ({
  prayerName: record.prayerName,
  prayerDate: record.date,
  scheduledTime: '00:00', // Default, will be updated with actual prayer times
  customTime: record.customTime,
  method: record.method as 'simple' | 'detailed'
});

export const convertFromApiFormat = (attendance: any): AttendanceRecord => ({
  id: `${attendance.prayerName}-${attendance.prayerDate}-${attendance.id}`,
  date: attendance.prayerDate.split('T')[0],
  prayerName: attendance.prayerName,
  attendedAt: attendance.attendedAt,
  timeStatus: attendance.isEarly === true ? 'early' : attendance.isEarly === false ? 'late' : 'on_time',
  location: 'Unknown',
  customTime: attendance.customTime,
  method: attendance.method || 'simple'
});

// API Service Class
export class AttendanceApiService {
  private static async handleResponse(response: Response) {
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }
    return response.json();
  }

  static async getAttendances(): Promise<AttendanceRecord[]> {
    const response = await fetch('/api/attendance');
    const result: ApiAttendanceResponse = await this.handleResponse(response);
    
    return result.attendances.map(convertFromApiFormat);
  }

  static async saveAttendance(prayerName: PrayerName, options: {
    date?: string;
    customTime?: string;
    method?: 'simple' | 'detailed';
  } = {}): Promise<AttendanceRecord> {
    const apiData: ApiAttendanceData = {
      prayerName,
      prayerDate: options.date || new Date().toISOString().split('T')[0],
      scheduledTime: '00:00',
      customTime: options.customTime,
      method: options.method || 'simple'
    };

    console.log('Saving to API:', apiData);
    
    const response = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiData)
    });

    const result = await this.handleResponse(response);
    console.log('Saved record:', result);
    
    return convertFromApiFormat(result.attendance);
  }

  static async deleteAttendance(prayerName: PrayerName, date: string): Promise<void> {
    const response = await fetch(
      `/api/attendance?prayerName=${encodeURIComponent(prayerName)}&prayerDate=${encodeURIComponent(date)}`,
      { method: 'DELETE' }
    );

    await this.handleResponse(response);
  }

  static async getStats() {
    const response = await fetch('/api/stats');
    return this.handleResponse(response);
  }

  static async syncData(records: AttendanceRecord[]) {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records })
    });

    return this.handleResponse(response);
  }
}