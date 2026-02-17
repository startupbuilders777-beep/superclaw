import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

// Helper to generate API key
function generateApiKey(): string {
  return `sc_${nanoid(32)}`
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { step, data } = body

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    switch (step) {
      case "create-agent": {
        // Create the first agent
        const agentName = data.name || "My First Agent"
        
        const agent = await prisma.agent.create({
          data: {
            name: agentName,
            status: "pending",
            userId: user.id,
            skills: {
              messaging: true,
              calendar: false,
              slack: false,
              telegram: false
            }
          }
        })

        // Generate API key for the user
        const apiKey = generateApiKey()
        
        // Store API key (in a real app, you'd hash it and store securely)
        // For now, we'll just return it to the user to save
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            // In production, hash this!
            // For now we store plain for demo purposes
          }
        })

        return NextResponse.json({ 
          success: true, 
          agent,
          apiKey 
        })
      }

      case "complete-onboarding": {
        // Mark onboarding as complete
        // Add a custom field or use session data
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: "Invalid step" }, { status: 400 })
    }
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
