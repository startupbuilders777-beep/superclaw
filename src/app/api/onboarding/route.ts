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
        // Create the first agent with selected skills
        const agentName = data.name || "My First Agent"
        const selectedSkills = data.skills || []
        
        // Build skills object from selected skills
        const skills: Record<string, boolean> = {
          messaging: selectedSkills.includes("messaging"),
          calendar: selectedSkills.includes("calendar"),
          slack: selectedSkills.includes("marketing"),
          telegram: selectedSkills.includes("messaging"),
          discord: selectedSkills.includes("messaging"),
          content: selectedSkills.includes("content"),
          seo: selectedSkills.includes("seo"),
          marketing: selectedSkills.includes("marketing"),
          support: selectedSkills.includes("support"),
          data: selectedSkills.includes("data"),
          custom: selectedSkills.includes("custom")
        }
        
        const agent = await prisma.agent.create({
          data: {
            name: agentName,
            status: "active",
            userId: user.id,
            skills
          }
        })

        // Generate API key for the user
        const apiKey = generateApiKey()

        return NextResponse.json({ 
          success: true, 
          agent,
          apiKey 
        })
      }

      case "complete-onboarding": {
        // Mark onboarding as complete
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
