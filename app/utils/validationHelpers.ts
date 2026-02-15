export function validateAttendanceData(data: any) {
  const errors: string[] = []

  if (!data.prayerName || typeof data.prayerName !== 'string') {
    errors.push('prayerName is required and must be a string')
  }

  if (!data.prayerDate || typeof data.prayerDate !== 'string') {
    errors.push('prayerDate is required and must be a string')
  }

  if (!data.scheduledTime || typeof data.scheduledTime !== 'string') {
    errors.push('scheduledTime is required and must be a string')
  }

  // Validate prayerDate format (YYYY-MM-DD)
  if (data.prayerDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.prayerDate)) {
    errors.push('prayerDate must be in YYYY-MM-DD format')
  }

  // Validate scheduledTime format (HH:MM)
  if (data.scheduledTime && !/^\d{2}:\d{2}$/.test(data.scheduledTime)) {
    errors.push('scheduledTime must be in HH:MM format')
  }

  // Validate customTime format if provided
  if (data.customTime && !/^\d{2}:\d{2}$/.test(data.customTime)) {
    errors.push('customTime must be in HH:MM format')
  }

  // Validate method if provided
  if (data.method && !['simple', 'detailed'].includes(data.method)) {
    errors.push('method must be either "simple" or "detailed"')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateDeleteParams(prayerName: string, prayerDate: string) {
  const errors: string[] = []

  if (!prayerName) {
    errors.push('prayerName is required')
  }

  if (!prayerDate) {
    errors.push('prayerDate is required')
  }

  // Validate prayerDate format
  if (prayerDate && !/^\d{4}-\d{2}-\d{2}$/.test(prayerDate)) {
    errors.push('prayerDate must be in YYYY-MM-DD format')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}