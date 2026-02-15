import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "../../lib/prisma"
import { authOptions } from "../auth/[...nextauth]/route"

// GET /api/stats - Get user's prayer statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const periodDays = Number.parseInt(period)

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - periodDays)

    // Get basic stats
    const totalRecords = await prisma.prayerAttendance.count({
      where: {
        userId: session.user.id,
        prayerDate: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // Get stats by prayer
    const statsByPrayer = await prisma.prayerAttendance.groupBy({
      by: ['prayerName'],
      where: {
        userId: session.user.id,
        prayerDate: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      }
    })

    // Get unique days tracked
    const uniqueDays = await prisma.prayerAttendance.findMany({
      where: {
        userId: session.user.id,
        prayerDate: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        prayerDate: true
      },
      distinct: ['prayerDate']
    })

    // Calculate timing analysis
    const timingStats = await prisma.prayerAttendance.groupBy({
      by: ['isEarly'],
      where: {
        userId: session.user.id,
        prayerDate: {
          gte: startDate,
          lte: endDate
        },
        isEarly: {
          not: null
        }
      },
      _count: {
        id: true
      },
      _avg: {
        delayMinutes: true
      }
    })

    // Calculate streaks
    const recentAttendances = await prisma.prayerAttendance.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        prayerDate: 'desc'
      },
      take: 100,
      select: {
        prayerDate: true,
        prayerName: true
      }
    })

    // Simple streak calculation (consecutive days with any prayer)
    const attendanceDates = [...new Set(
      recentAttendances.map((a: { prayerDate: Date }) => a.prayerDate.toISOString().split('T')[0])
    )].sort((a, b) => b.localeCompare(a))

    let currentStreak = 0
    const today = new Date().toISOString().split('T')[0]
    
    for (let i = 0; i < attendanceDates.length; i++) {
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() - i)
      const expectedDateStr = expectedDate.toISOString().split('T')[0]
      
      if (attendanceDates[i] === expectedDateStr) {
        currentStreak++
      } else {
        break
      }
    }

    // Calculate completion rate
    const totalPossiblePrayers = uniqueDays.length * 5 // 5 prayers per day
    const completionRate = totalPossiblePrayers > 0 ? 
      Math.round((totalRecords / totalPossiblePrayers) * 100) : 0

    return NextResponse.json({
      period: periodDays,
      totalRecords,
      uniqueDays: uniqueDays.length,
      completionRate,
      currentStreak,
      statsByPrayer: statsByPrayer.reduce((acc: Record<string, number>, stat: { prayerName: string; _count: { id: number } }) => {
        acc[stat.prayerName] = stat._count.id
        return acc
      }, {} as Record<string, number>),
      timingAnalysis: {
        early: timingStats.find((s: { isEarly: boolean }) => s.isEarly === true)?._count.id || 0,
        late: timingStats.find((s: { isEarly: boolean }) => s.isEarly === false)?._count.id || 0,
        averageDelay: timingStats.find((s: { isEarly: boolean }) => s.isEarly === false)?._avg.delayMinutes || 0
      }
    })
    
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}