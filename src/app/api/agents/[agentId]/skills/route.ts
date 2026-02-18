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
  
  const { skills } = body

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

  const updatedAgent = await prisma.agent.update({
    where: { id: agentId },
    data: {
      skills: skills as any
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
    skills: agent.skills
  })
}
