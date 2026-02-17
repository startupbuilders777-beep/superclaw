import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { checkContainerHealth, updateAgentHealth, alertOnFailure } from "@/lib/health"
import prisma from "@/lib/prisma"

// GET /api/health/:agentId - Check health status of an agent
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { agentId } = await params

  // Verify ownership
  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: session.user.id },
  })

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  // Check container health
  const health = await checkContainerHealth(agentId)

  // Update the agent's health status in DB
  await updateAgentHealth(agentId, health.status, health.error)

  return NextResponse.json({
    agentId,
    status: health.status,
    containerStatus: agent.containerStatus,
    lastHealthCheck: new Date(),
  })
}

// POST /api/health/:agentId/refresh - Force refresh health status
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { agentId } = await params

  // Verify ownership
  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: session.user.id },
  })

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  // Perform health check
  const health = await checkContainerHealth(agentId)
  await updateAgentHealth(agentId, health.status, health.error)

  // Alert if unhealthy
  if (health.status === "unhealthy" && health.error) {
    await alertOnFailure(agentId, health.error)
  }

  return NextResponse.json({
    agentId,
    status: health.status,
    error: health.error,
    updated: true,
  })
}
