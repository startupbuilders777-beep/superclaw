import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth/password"
import { isDatabaseConfigured, getDatabaseConfigStatus } from "@/lib/env"
import { PrismaClient } from "@prisma/client"

// Lazy initialization of Prisma client - only create when DATABASE_URL is confirmed
// This prevents Prisma from throwing during module load when DATABASE_URL is missing
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
  
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  
  return client;
}

// Log env status on module load for debugging
console.log("[register] DATABASE_URL set:", !!process.env.DATABASE_URL)
console.log("[register] NODE_ENV:", process.env.NODE_ENV)

export async function POST(request: Request) {
  // First check if database is configured - do this BEFORE any prisma operations
  const dbConfigured = isDatabaseConfigured()
  const dbStatus = getDatabaseConfigStatus()
  console.log("[register] isDatabaseConfigured:", dbConfigured)
  console.log("[register] dbStatus:", JSON.stringify(dbStatus))
  
  if (!dbConfigured) {
    console.error("Registration failed: DATABASE_URL not properly configured")
    
    // Provide specific error message based on the issue
    let errorMessage = "Service temporarily unavailable. Please try again later."
    let errorCode = "DB_NOT_CONFIGURED"
    
    if (dbStatus.reason?.includes('localhost')) {
      errorMessage = "Database configuration error: DATABASE_URL points to localhost. Please configure a production database (Neon, Supabase, or Railway) in Vercel project settings."
      errorCode = "DB_LOCALHOST"
    } else if (dbStatus.reason?.includes('not set')) {
      errorMessage = "Database not configured. Please add DATABASE_URL to your Vercel project environment variables."
      errorCode = "DB_MISSING"
    }
    
    return NextResponse.json(
      { error: errorMessage, code: errorCode, details: dbStatus.reason },
      { status: 503 }
    )
  }

  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const prisma = getPrismaClient()
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error("Registration error:", error)
    
    // Provide more specific error messages for common issues
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    // Check for various database connection error patterns
    const isDbError = 
      errorMessage.includes("database") ||
      errorMessage.includes("DATABASE_URL") ||
      errorMessage.includes("Prisma") ||
      errorMessage.includes("prisma") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("P1001") ||
      errorMessage.includes("P1002")
    
    if (isDbError) {
      console.error("Database connection error detected:", errorMessage)
      return NextResponse.json(
        { error: "Database temporarily unavailable. Please try again later." },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
