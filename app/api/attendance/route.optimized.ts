import { NextRequest } from "next/server"
import { validateSession, createApiResponse, createErrorResponse, parseRequestBody, extractQueryParams } from "../../utils/apiHelpers"
import { AttendanceRepository } from "../../repositories/attendanceRepository"
import { validateAttendanceData, validateDeleteParams } from "../../utils/validationHelpers"

interface AttendanceRequestBody {
  prayerName: string;
  prayerDate: string;
  scheduledTime: string;
  customTime?: string;
  method?: string;
}

// GET /api/attendance - Get user's attendance records
export async function GET(request: NextRequest) {
  try {
    const sessionResult = await validateSession()
    if (!sessionResult.isValid) {
      return createErrorResponse(sessionResult.error!.message, sessionResult.error!.status)
    }

    const params = extractQueryParams(request)
    const date = params.get('date')
    const limit = params.getInt('limit', 30)

    const filters = {
      userId: sessionResult.userId!,
      date: date ? new Date(date) : undefined,
      limit
    }

    const attendances = await AttendanceRepository.findMany(filters)

    return createApiResponse({ attendances })
    
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return createErrorResponse("Internal server error", 500)
  }
}

// POST /api/attendance - Create/Update attendance record
export async function POST(request: NextRequest) {
  try {
    const sessionResult = await validateSession()
    if (!sessionResult.isValid) {
      return createErrorResponse(sessionResult.error!.message, sessionResult.error!.status)
    }

    const body = await parseRequestBody<AttendanceRequestBody>(request)
    
    // Validate input data
    const validation = validateAttendanceData(body)
    if (!validation.isValid) {
      return createErrorResponse(
        `Validation errors: ${validation.errors.join(', ')}`, 
        400
      )
    }

    const { prayerName, prayerDate, scheduledTime, customTime, method } = body

    const attendance = await AttendanceRepository.upsert({
      userId: sessionResult.userId!,
      prayerName,
      prayerDate: new Date(prayerDate),
      scheduledTime,
      customTime,
      method
    })

    return createApiResponse({ attendance }, 201)
    
  } catch (error) {
    console.error('Error creating attendance:', error)
    return createErrorResponse("Internal server error", 500)
  }
}

// DELETE /api/attendance - Delete attendance record
export async function DELETE(request: NextRequest) {
  try {
    const sessionResult = await validateSession()
    if (!sessionResult.isValid) {
      return createErrorResponse(sessionResult.error!.message, sessionResult.error!.status)
    }

    const params = extractQueryParams(request)
    const prayerName = params.get('prayerName')
    const prayerDate = params.get('prayerDate')

    // Validate parameters
    const validation = validateDeleteParams(prayerName!, prayerDate!)
    if (!validation.isValid) {
      return createErrorResponse(
        `Validation errors: ${validation.errors.join(', ')}`, 
        400
      )
    }

    await AttendanceRepository.deleteMany(
      sessionResult.userId!,
      prayerName!,
      new Date(prayerDate!)
    )

    return createApiResponse({ success: true })
    
  } catch (error) {
    console.error('Error deleting attendance:', error)
    return createErrorResponse("Internal server error", 500)
  }
}