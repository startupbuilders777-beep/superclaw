import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { processAgentMessage } from "@/lib/agent-commander"

// POST /api/agents/[id]/run - Run an agent with user input
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: agentId } = await params
    
    // Parse request body
    const body = await req.json()
    const { message } = body

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ 
        error: "Message is required and must be a non-empty string" 
      }, { status: 400 })
    }

    // Get the agent and verify ownership
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Verify the agent belongs to the current user
    if (agent.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Process the message through the agent
    const response = await processAgentMessage(
      agentId,
      message.trim(),
      {
        source: 'api',
        sourceId: session.user.id,
        userId: session.user.id,
      }
    )

    // Log the interaction
    console.log(`[AgentRun] Agent ${agentId} processed message from user ${session.user.id}`)

    return NextResponse.json({ 
      success: true,
      agentId: agent.id,
      agentName: agent.name,
      message: message.trim(),
      response: response,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[AgentRun] Failed to run agent:", error)
    return NextResponse.json({ 
      error: "Failed to run agent" 
    }, { status: 500 })
  }
}
