import { getServerSession } from "next-auth"
import { NextRequest } from "next/server"
import { authOptions } from "../api/auth/[...nextauth]/route"

export async function validateSession() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return { 
      isValid: false, 
      error: { message: "Unauthorized", status: 401 },
      userId: null 
    }
  }
  
  return { 
    isValid: true, 
    error: null,
    userId: session.user.id,
    user: session.user
  }
}

export function createApiResponse<T>(data: T, status: number = 200) {
  return Response.json(data, { status })
}

export function createErrorResponse(message: string, status: number = 500) {
  return Response.json({ error: message }, { status })
}

export async function parseRequestBody<T>(request: NextRequest): Promise<T> {
  try {
    return await request.json()
  } catch {
    throw new Error("Invalid JSON in request body")
  }
}

export function extractQueryParams(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  return {
    get: (key: string, defaultValue?: string) => searchParams.get(key) || defaultValue,
    getInt: (key: string, defaultValue?: number) => {
      const value = searchParams.get(key)
      return value ? Number.parseInt(value, 10) : defaultValue
    }
  }
}