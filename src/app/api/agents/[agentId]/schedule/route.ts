import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { agentId } = await params
  const body = await request.json()
  
  const { scheduleEnabled, scheduleType, scheduleTime, scheduleDay, scheduleCron } = body

  // Verify agent belongs to user
  const agent = await prisma.agent.findFirst({
    where: {
      id: agentId,
      user: {
        email: session.user.email
      }
    }
  })

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  // Update schedule
  const updatedAgent = await prisma.agent.update({
    where: { id: agentId },
    data: {
      scheduleEnabled: scheduleEnabled ?? false,
      scheduleType: scheduleType ?? null,
      scheduleTime: scheduleTime ?? null,
      scheduleDay: scheduleDay ?? null,
      scheduleCron: scheduleCron ?? null
    }
  })

  return NextResponse.json(updatedAgent)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { agentId } = await params

  // Verify agent belongs to user
  const agent = await prisma.agent.findFirst({
    where: {
      id: agentId,
      user: {
        email: session.user.email
      }
    }
  })

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  return NextResponse.json({
    scheduleEnabled: agent.scheduleEnabled,
    scheduleType: agent.scheduleType,
    scheduleTime: agent.scheduleTime,
    scheduleDay: agent.scheduleDay,
    scheduleCron: agent.scheduleCron
  })
}
