import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { recordMessage, checkMessageLimit, getUsageHistory } from "@/lib/usage"

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { agentId, count = 1 } = body

    const result = await recordMessage(session.user.id, agentId, count)

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to record message", ...result },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      used: result.used,
      limit: result.limit,
      overLimit: result.overLimit,
    })
  } catch (error) {
    console.error("Error recording message:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const history = searchParams.get("history") === "true"

    const limitInfo = await checkMessageLimit(session.user.id)

    const response: Record<string, unknown> = {
      used: limitInfo.used,
      limit: limitInfo.limit,
      remaining: limitInfo.remaining,
      allowed: limitInfo.allowed,
    }

    if (history) {
      response.history = await getUsageHistory(session.user.id)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error getting usage:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
