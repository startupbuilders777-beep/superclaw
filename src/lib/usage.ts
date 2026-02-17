import prisma from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

// Get the current billing period (monthly)
export function getCurrentBillingPeriod(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  return { start, end }
}

// Check if user has exceeded their message limit
export async function checkMessageLimit(userId: string): Promise<{
  allowed: boolean
  used: number
  limit: number
  remaining: number
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      messagesThisMonth: true,
      messageLimit: true,
      subscriptionTier: true,
    },
  })

  if (!user) {
    return { allowed: false, used: 0, limit: 0, remaining: 0 }
  }

  // Unlimited tier (PRO, AGENCY)
  if (user.messageLimit === -1) {
    return { allowed: true, used: user.messagesThisMonth, limit: -1, remaining: -1 }
  }

  const used = user.messagesThisMonth
  const limit = user.messageLimit || 0
  const remaining = Math.max(0, limit - used)

  return {
    allowed: remaining > 0,
    used,
    limit,
    remaining,
  }
}

// Record a message sent by the user
export async function recordMessage(
  userId: string,
  agentId?: string,
  count: number = 1
): Promise<{ success: boolean; overLimit: boolean; used: number; limit: number }> {
  const period = getCurrentBillingPeriod()

  // Get current user state
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      messagesThisMonth: true,
      messageLimit: true,
      subscriptionTier: true,
    },
  })

  if (!user) {
    return { success: false, overLimit: false, used: 0, limit: 0 }
  }

  // Check if user is on unlimited tier
  if (user.messageLimit === -1) {
    // Still record the usage for analytics
    await prisma.messageUsage.create({
      data: {
        userId,
        count,
        periodStart: period.start,
        periodEnd: period.end,
        agentId,
      },
    })

    // Increment counter
    await prisma.user.update({
      where: { id: userId },
      data: {
        messagesThisMonth: { increment: count },
      },
    })

    return { success: true, overLimit: false, used: user.messagesThisMonth + count, limit: -1 }
  }

  const newUsed = user.messagesThisMonth + count
  const limit = user.messageLimit || 0
  const overLimit = newUsed > limit

  // Record usage in history
  await prisma.messageUsage.create({
    data: {
      userId,
      count,
      periodStart: period.start,
      periodEnd: period.end,
      agentId,
    },
  })

  // Update user's message count
  await prisma.user.update({
    where: { id: userId },
    data: {
      messagesThisMonth: { increment: count },
    },
  })

  return {
    success: true,
    overLimit,
    used: newUsed,
    limit,
  }
}

// Reset monthly message count (called on new billing period or manually)
export async function resetMonthlyUsage(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      messagesThisMonth: 0,
    },
  })
}

// Get usage history for a user
export async function getUsageHistory(
  userId: string,
  months: number = 6
): Promise<Array<{ month: string; count: number }>> {
  const now = new Date()
  const results: Array<{ month: string; count: number }> = []

  for (let i = 0; i < months; i++) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

    const usage = await prisma.messageUsage.aggregate({
      where: {
        userId,
        periodStart: { gte: start },
        periodEnd: { lte: end },
      },
      _sum: {
        count: true,
      },
    })

    results.push({
      month: start.toLocaleString("default", { month: "short", year: "numeric" }),
      count: usage._sum.count || 0,
    })
  }

  return results.reverse()
}

// Calculate overage charges (for Starter tier)
export function calculateOverageCharge(additionalMessages: number): number {
  // $0.10 per additional message
  const ratePerMessage = 10 // in cents
  return additionalMessages * ratePerMessage
}

// Get message limit for a subscription tier
export function getTierMessageLimit(tier: string): number {
  const limits: Record<string, number> = {
    FREE: 100,
    STARTER: 500,
    PRO: -1, // unlimited
    AGENCY: -1, // unlimited
  }
  return limits[tier] ?? 0
}
