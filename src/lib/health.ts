import prisma from "@/lib/prisma"

// Health status types
export type HealthStatus = "healthy" | "unhealthy" | "unknown"

// Check if a container is healthy
// In production, this would check the actual container status via Docker API
export async function checkContainerHealth(agentId: string): Promise<{
  status: HealthStatus
  error?: string
}> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
  })

  if (!agent || !agent.containerId) {
    return { status: "unknown", error: "No container found" }
  }

  // In production, use Docker API to check container health
  // For now, we'll simulate based on containerStatus
  const containerStatus = agent.containerStatus?.toLowerCase() || ""

  if (containerStatus.includes("running")) {
    return { status: "healthy" }
  } else if (containerStatus.includes("exited") || containerStatus.includes("dead")) {
    return { status: "unhealthy", error: `Container not running: ${containerStatus}` }
  }

  return { status: "unknown", error: "Unable to determine status" }
}

// Update agent health status in database
export async function updateAgentHealth(
  agentId: string,
  status: HealthStatus,
  error?: string
): Promise<void> {
  await prisma.agent.update({
    where: { id: agentId },
    data: {
      healthStatus: status,
      lastHealthCheck: new Date(),
      lastError: error || null,
    },
  })
}

// Get all agents that need health monitoring
export async function getAgentsForHealthCheck(): Promise<
  Array<{
    id: string
    name: string
    containerId: string | null
    containerStatus: string | null
    healthStatus: string | null
    lastHealthCheck: Date | null
    restartCount: number
  }>
> {
  return prisma.agent.findMany({
    where: {
      status: "active",
      containerId: { not: null },
    },
    select: {
      id: true,
      name: true,
      containerId: true,
      containerStatus: true,
      healthStatus: true,
      lastHealthCheck: true,
      restartCount: true,
    },
  })
}

// Check if agent needs restart (unhealthy)
export async function shouldRestartAgent(agentId: string): Promise<boolean> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: {
      healthStatus: true,
      restartCount: true,
    },
  })

  if (!agent) return false

  // Don't restart more than 3 times in an hour to avoid restart loops
  if (agent.restartCount >= 3) {
    return false
  }

  return agent.healthStatus === "unhealthy"
}

// Record a restart attempt
export async function recordRestart(agentId: string): Promise<void> {
  await prisma.agent.update({
    where: { id: agentId },
    data: {
      restartCount: { increment: 1 },
      status: "pending",
    },
  })
}

// Alert on agent failure (log for now, could integrate with Slack/Discord)
export async function alertOnFailure(
  agentId: string,
  error: string
): Promise<void> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { user: true },
  })

  if (!agent) return

  // Log the error (in production, send to Slack/Discord/PagerDuty)
  console.error(`[ALERT] Agent ${agent.name} (${agentId}) failed: ${error}`)
  console.error(`[ALERT] User: ${agent.user.email}`)

  // Could extend this to send actual notifications
  // await sendDiscordAlert(...)
  // await sendSlackAlert(...)
}
