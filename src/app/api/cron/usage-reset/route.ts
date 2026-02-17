import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentBillingPeriod } from "@/lib/usage"

// Cron endpoint to reset monthly usage for all users
// This should be called on the 1st of each month
export async function POST(req: NextRequest) {
  // Verify cron secret
  const cronSecret = req.headers.get("x-cron-secret")
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Reset all users' monthly message counts
    const result = await prisma.user.updateMany({
      where: {
        subscriptionTier: {
          not: "FREE",
        },
      },
      data: {
        messagesThisMonth: 0,
      },
    })

    console.log(`Reset monthly usage for ${result.count} users`)

    return NextResponse.json({
      success: true,
      resetCount: result.count,
    })
  } catch (error) {
    console.error("Error resetting monthly usage:", error)
    return NextResponse.json(
      { error: "Failed to reset monthly usage" },
      { status: 500 }
    )
  }
}
