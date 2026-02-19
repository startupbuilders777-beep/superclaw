import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { checkContainerLimit } from "@/lib/multi-tenant"

// GET /api/agents - List all agents for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const agents = await prisma.agent.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ agents })
  } catch (error) {
    console.error("Failed to fetch agents:", error)
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 })
  }
}

// POST /api/agents - Create a new agent
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, skills } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Agent name is required" }, { status: 400 })
    }

    // Get user to check subscription tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check agent limit based on tier
    const limitCheck = await checkContainerLimit(session.user.id, user.subscriptionTier)
    if (!limitCheck.allowed) {
      return NextResponse.json({ 
        error: "Agent limit reached",
        current: limitCheck.current,
        limit: limitCheck.limit,
        upgradeUrl: "/pricing"
      }, { status: 403 })
    }

    // Create the agent
    const agent = await prisma.agent.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        skills: skills || {},
        userId: session.user.id,
        status: "pending",
      },
    })

    return NextResponse.json({ 
      success: true, 
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        status: agent.status,
        skills: agent.skills,
        createdAt: agent.createdAt,
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Failed to create agent:", error)
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 })
  }
}
