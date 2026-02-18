import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Default prompt templates
const DEFAULT_TEMPLATES = [
  {
    id: "default-welcome",
    name: "Welcome Message",
    description: "Initial greeting when user starts a conversation",
    content: "Hello! I'm your AI assistant. How can I help you today?",
    category: "greeting"
  },
  {
    id: "default-system",
    name: "System Prompt",
    description: "Core instructions for your agent's behavior",
    content: "You are a helpful AI assistant. Be concise, friendly, and professional.",
    category: "system"
  },
  {
    id: "default-fallback",
    name: "Fallback Response",
    description: "When the agent doesn't understand",
    content: "I'm not sure I understand. Could you rephrase that?",
    category: "fallback"
  }
]

// GET /api/prompt-templates - Get all prompt templates for user
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      agents: {
        select: {
          skills: true
        }
      }
    }
  })
  
  // Extract templates from agent skills or use defaults
  const templates = DEFAULT_TEMPLATES.map((template: any) => {
    // Look for custom template in agent skills
    const customTemplate = user?.agents.flatMap((agent: any) => 
      agent.skills?.promptTemplates || []
    ).find((t: any) => t.id === template.id)
    
    return customTemplate || template
  })
  
  return NextResponse.json({ templates })
}

// PUT /api/prompt-templates - Save prompt templates
export async function PUT(request: Request) {
  const session = await auth()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const body = await request.json()
  const { templates } = body
  
  if (!Array.isArray(templates)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
  
  // Get user and their first agent (or create one)
  let user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  
  // Update first agent's skills with templates, or create if none exist
  const existingAgent = await prisma.agent.findFirst({
    where: { userId: user.id }
  })
  
  if (existingAgent) {
    const currentSkills = (existingAgent.skills as any) || {}
    await prisma.agent.update({
      where: { id: existingAgent.id },
      data: {
        skills: {
          ...currentSkills,
          promptTemplates: templates
        }
      }
    })
  } else {
    // Create a default agent with the templates
    await prisma.agent.create({
      data: {
        userId: user.id,
        name: "My Agent",
        skills: {
          promptTemplates: templates
        } as any
      }
    })
  }
  
  return NextResponse.json({ success: true, templates })
}
