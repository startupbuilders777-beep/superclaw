import { NextResponse } from "next/server"
import { isDatabaseConfigured, getDatabaseConfigStatus } from "@/lib/env"

export async function GET() {
  const dbConfigured = isDatabaseConfigured()
  const dbStatus = getDatabaseConfigStatus()
  
  const status = {
    status: dbConfigured ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    checks: {
      database: dbConfigured ? "connected" : dbStatus.reason || "not configured",
      databaseUrl: dbStatus.urlPreview || "not set",
      nextauth: !!process.env.NEXTAUTH_SECRET ? "configured" : "missing NEXTAUTH_SECRET",
      nextauthUrl: !!process.env.NEXTAUTH_URL ? process.env.NEXTAUTH_URL : "missing NEXTAUTH_URL",
    }
  }
  
  // Return 503 if database is not configured
  if (!dbConfigured) {
    return NextResponse.json(status, { status: 503 })
  }
  
  return NextResponse.json(status)
}
