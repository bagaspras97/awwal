import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "../../lib/prisma"
import { authOptions } from "../auth/[...nextauth]/route"

// POST /api/sync - Bulk sync localStorage data to database
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { localData } = body

    if (!localData || typeof localData !== 'object') {
      return NextResponse.json(
        { error: "Invalid localData format" }, 
        { status: 400 }
      )
    }

    const syncResults = []
    let synced = 0
    let skipped = 0
    let errors = 0

    // Process each date in localStorage
    for (const [dateStr, dayData] of Object.entries(localData)) {
      if (!dayData || typeof dayData !== 'object') continue

      // Process each prayer for this date
      for (const [prayerName, prayerData] of Object.entries(dayData as Record<string, any>)) {
        try {
          if (!prayerData?.completed) continue

          // Extract prayer data
          const {
            completedAt,
            customTime,
            method = 'simple'
          } = prayerData

          // Try to determine scheduled time (fallback to customTime or default)
          let scheduledTime = customTime || '00:00'
          
          // Calculate timing analysis if possible
          let isEarly = null
          let delayMinutes = null
          
          if (customTime && method === 'detailed') {
            // Basic timing analysis without scheduled time
            isEarly = true // Assume early if custom time provided
            delayMinutes = 0
          }

          // Check if record already exists
          const existing = await prisma.prayerAttendance.findUnique({
            where: {
              userId_prayerName_prayerDate: {
                userId: session.user.id,
                prayerName,
                prayerDate: new Date(dateStr)
              }
            }
          })

          if (existing) {
            skipped++
            continue
          }

          // Create new record
          await prisma.prayerAttendance.create({
            data: {
              userId: session.user.id,
              prayerName,
              prayerDate: new Date(dateStr),
              scheduledTime,
              customTime,
              isEarly,
              delayMinutes,
              method,
              attendedAt: completedAt ? new Date(completedAt) : new Date()
            }
          })

          synced++

        } catch (error) {
          console.error(`Error syncing ${dateStr} ${prayerName}:`, error)
          errors++
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      synced,
      skipped,
      errors,
      message: `Synced ${synced} records, skipped ${skipped} existing, ${errors} errors`
    })
    
  } catch (error) {
    console.error('Error syncing data:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/sync/status - Check sync status and compare local vs server data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total records in database for this user
    const totalRecords = await prisma.prayerAttendance.count({
      where: {
        userId: session.user.id
      }
    })

    // Get recent records
    const recentRecords = await prisma.prayerAttendance.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        prayerDate: 'desc'
      },
      take: 10,
      select: {
        prayerName: true,
        prayerDate: true,
        method: true,
        createdAt: true
      }
    })

    // Calculate statistics
    const stats = await prisma.prayerAttendance.groupBy({
      by: ['prayerName'],
      where: {
        userId: session.user.id
      },
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      totalRecords,
      recentRecords,
      statsByPrayer: stats,
      lastSync: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error getting sync status:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}