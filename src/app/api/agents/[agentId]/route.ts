import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/agents/[agentId] - Get a single agent
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { agentId } = await params

    const agent = await prisma.agent.findFirst({
      where: { 
        id: agentId,
        userId: session.user.id,
      },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json({ agent })
  } catch (error) {
    console.error("Failed to fetch agent:", error)
    return NextResponse.json({ error: "Failed to fetch agent" }, { status: 500 })
  }
}

// PUT /api/agents/[agentId] - Update an agent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { agentId } = await params
    const body = await request.json()
    const { name, description, skills } = body

    // Check if agent exists and belongs to user
    const existingAgent = await prisma.agent.findFirst({
      where: { 
        id: agentId,
        userId: session.user.id,
      },
    })

    if (!existingAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Update the agent
    const updateData: { name?: string; description?: string; skills?: Record<string, boolean> } = {}
    
    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ error: "Agent name cannot be empty" }, { status: 400 })
      }
      updateData.name = name.trim()
    }
    
    if (description !== undefined) {
      updateData.description = description.trim()
    }
    
    if (skills !== undefined) {
      updateData.skills = skills
    }

    const agent = await prisma.agent.update({
      where: { id: agentId },
      data: updateData,
    })

    return NextResponse.json({ 
      success: true, 
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        status: agent.status,
        skills: agent.skills,
        updatedAt: agent.updatedAt,
      }
    })
  } catch (error) {
    console.error("Failed to update agent:", error)
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 })
  }
}

// DELETE /api/agents/[agentId] - Delete an agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { agentId } = await params

    // Check if agent exists and belongs to user
    const existingAgent = await prisma.agent.findFirst({
      where: { 
        id: agentId,
        userId: session.user.id,
      },
    })

    if (!existingAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Delete the agent (this will also handle container cleanup via trigger if needed)
    await prisma.agent.delete({
      where: { id: agentId },
    })

    return NextResponse.json({ 
      success: true, 
      message: "Agent deleted successfully"
    })
  } catch (error) {
    console.error("Failed to delete agent:", error)
    return NextResponse.json({ error: "Failed to delete agent" }, { status: 500 })
  }
}
