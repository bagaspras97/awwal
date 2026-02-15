import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "../../lib/prisma"
import { authOptions } from "../auth/[...nextauth]/route"
import { Prisma } from "@prisma/client"

// GET /api/attendance - Get user's attendance records
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const limit = Number.parseInt(searchParams.get('limit') || '30')

    const whereClause: Prisma.PrayerAttendanceWhereInput = {
      userId: session.user.id
    }

    if (date) {
      whereClause.prayerDate = new Date(date)
    }

    const attendances = await prisma.prayerAttendance.findMany({
      where: whereClause,
      orderBy: {
        prayerDate: 'desc'
      },
      take: limit
    })

    return NextResponse.json({ attendances })
    
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/attendance - Create/Update attendance record
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      prayerName, 
      prayerDate, 
      scheduledTime, 
      customTime, 
      method = 'simple' 
    } = body

    // Validation
    if (!prayerName || !prayerDate || !scheduledTime) {
      return NextResponse.json(
        { error: "Missing required fields: prayerName, prayerDate, scheduledTime" }, 
        { status: 400 }
      )
    }

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

    // Upsert attendance record
    const attendance = await prisma.prayerAttendance.upsert({
      where: {
        userId_prayerName_prayerDate: {
          userId: session.user.id,
          prayerName,
          prayerDate: new Date(prayerDate)
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
        userId: session.user.id,
        prayerName,
        prayerDate: new Date(prayerDate),
        scheduledTime,
        customTime,
        isEarly,
        delayMinutes,
        method,
        attendedAt: new Date()
      }
    })

    return NextResponse.json({ attendance }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating attendance:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/attendance - Delete attendance record
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const prayerName = searchParams.get('prayerName')
    const prayerDate = searchParams.get('prayerDate')

    if (!prayerName || !prayerDate) {
      return NextResponse.json(
        { error: "Missing required parameters: prayerName, prayerDate" }, 
        { status: 400 }
      )
    }

    await prisma.prayerAttendance.deleteMany({
      where: {
        userId: session.user.id,
        prayerName,
        prayerDate: new Date(prayerDate)
      }
    })

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error deleting attendance:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}