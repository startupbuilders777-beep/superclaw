import { NextRequest, NextResponse } from "next/server"
import { getAgentsForHealthCheck, checkContainerHealth, updateAgentHealth, alertOnFailure, shouldRestartAgent } from "@/lib/health"
import prisma from "@/lib/prisma"

// Cron endpoint to monitor all agent containers
// Should be called every 5 minutes
export async function POST(req: NextRequest) {
  // Verify cron secret
  const cronSecret = req.headers.get("x-cron-secret")
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const agents = await getAgentsForHealthCheck()
    const results: Array<{
      agentId: string
      status: string
      error?: string
      restarted?: boolean
    }> = []

    for (const agent of agents) {
      // Check health
      const health = await checkContainerHealth(agent.id)
      await updateAgentHealth(agent.id, health.status, health.error)

      results.push({
        agentId: agent.id,
        status: health.status,
        error: health.error,
      })

      // Alert on failure
      if (health.status === "unhealthy" && health.error) {
        await alertOnFailure(agent.id, health.error)
      }

      // Auto-restart if unhealthy (in production, this would trigger actual restart)
      if (health.status === "unhealthy") {
        const canRestart = await shouldRestartAgent(agent.id)
        if (canRestart) {
          // In production, call container restart API
          // await restartContainer(agent.containerId)
          await prisma.agent.update({
            where: { id: agent.id },
            data: {
              restartCount: agent.restartCount + 1,
              status: "pending",
            },
          })
          results[results.length - 1].restarted = true
        }
      }
    }

    return NextResponse.json({
      success: true,
      checked: results.length,
      results,
    })
  } catch (error) {
    console.error("Error in health monitor cron:", error)
    return NextResponse.json(
      { error: "Health monitor failed" },
      { status: 500 }
    )
  }
}
