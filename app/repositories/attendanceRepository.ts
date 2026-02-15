import { prisma } from '../lib/prisma'

export interface CreateAttendanceParams {
  userId: string
  prayerName: string
  prayerDate: Date
  scheduledTime: string
  customTime?: string
  method?: string
}

export interface AttendanceFilters {
  userId: string
  date?: Date
  limit?: number
}

export class AttendanceRepository {
  static async findMany(filters: AttendanceFilters) {
    const whereClause: Record<string, any> = {
      userId: filters.userId
    }

    if (filters.date) {
      whereClause.prayerDate = filters.date
    }

    return prisma.prayerAttendance.findMany({
      where: whereClause,
      orderBy: {
        prayerDate: 'desc'
      },
      take: filters.limit || 30
    })
  }

  static async upsert(params: CreateAttendanceParams) {
    const {
      userId,
      prayerName,
      prayerDate,
      scheduledTime,
      customTime,
      method = 'simple'
    } = params

    // Calculate timing analysis if customTime provided
    let isEarly = null
    let delayMinutes = null
    
    if (customTime && method === 'detailed') {
      const scheduled = new Date(`2000-01-01T${scheduledTime}`)
      const actual = new Date(`2000-01-01T${customTime}`)
      const diffMs = actual.getTime() - scheduled.getTime()
      const diffMinutes = Math.round(diffMs / 60000)
      
      isEarly = diffMinutes <= 0
      delayMinutes = Math.max(diffMinutes, 0)
    }

    return prisma.prayerAttendance.upsert({
      where: {
        userId_prayerName_prayerDate: {
          userId,
          prayerName,
          prayerDate
        }
      },
      update: {
        scheduledTime,
        customTime,
        isEarly,
        delayMinutes,
        method,
        attendedAt: new Date(),
        updatedAt: new Date()
      },
      create: {
        userId,
        prayerName,
        prayerDate,
        scheduledTime,
        customTime,
        isEarly,
        delayMinutes,
        method,
        attendedAt: new Date()
      }
    })
  }

  static async deleteMany(userId: string, prayerName: string, prayerDate: Date) {
    return prisma.prayerAttendance.deleteMany({
      where: {
        userId,
        prayerName,
        prayerDate
      }
    })
  }

  static async bulkUpsert(records: CreateAttendanceParams[]) {
    const results = []
    
    for (const record of records) {
      try {
        const result = await this.upsert(record)
        results.push({ success: true, record: result })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.push({ success: false, error: errorMessage })
      }
    }
    
    return results
  }
}