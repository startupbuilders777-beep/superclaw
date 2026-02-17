import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Discord interaction types
interface DiscordInteraction {
  type: number // 1 = ping, 2 = application command, 3 = component
  data?: {
    name?: string
    options?: { name: string; value: string }[]
    custom_id?: string
  }
  member?: {
    user: {
      id: string
      username: string
    }
  }
  channel_id?: string
  token?: string
}

// Skills dropdown options for Discord
const skillsSelectMenu = {
  type: 3, // Select menu
  custom_id: "skills_select",
  placeholder: "Select skills for your agent",
  options: [
    { label: "📝 Content Writing", value: "skill_content", default: false },
    { label: "🔍 SEO", value: "skill_seo", default: false },
    { label: "📢 Marketing", value: "skill_marketing", default: false },
    { label: "💬 Support", value: "skill_support", default: false },
    { label: "📊 Data Analysis", value: "skill_data", default: false },
    { label: "⚙️ Custom", value: "skill_custom", default: false }
  ]
}

// Onboarding state for Discord (using Discord ID as key)
const discordOnboardingState = new Map<string, {
  step: "start" | "name" | "skills" | "complete"
  userId?: string
  agentName?: string
  selectedSkills: string[]
}>()

export async function POST(request: Request) {
  try {
    const body: DiscordInteraction = await request.json()

    // Handle PING (Discord slash command registration)
    if (body.type === 1) {
      return NextResponse.json({ type: 1 }) // PONG
    }

    // Handle application commands (slash commands)
    if (body.type === 2 && body.data?.name === "start") {
      const userId = body.member?.user.id
      const username = body.member?.user.username

      if (!userId) {
        return NextResponse.json({
          type: 4,
          data: { content: "Unable to identify your account. Please sign up first." }
        })
      }

      // Check if user exists
      let user = await prisma.user.findUnique({ where: { discordId: userId } })

      if (!user) {
        // Try to find by name
        user = await prisma.user.findFirst({ where: { name: username } })
      }

      if (!user) {
        // New user - direct to signup
        return NextResponse.json({
          type: 4,
          data: {
            content: `Welcome to SuperClaw! 🚀\n\nTo get started, please sign up on our website:\n\n${process.env.NEXT_PUBLIC_APP_URL || "https://superclaw.ai"}/register\n\nOnce you've created an account, come back here and use /start to set up your agent.`
          }
        })
      }

      // Check existing agents
      const agents = await prisma.agent.findMany({ where: { userId: user.id } })

      if (agents.length > 0) {
        return NextResponse.json({
          type: 4,
          data: {
            content: `Welcome back, ${username}! 👋\n\nYou have ${agents.length} agent(s) configured:\n\n${agents.map((a, i) => `${i + 1}. ${a.name} - ${a.status}`).join("\n")}\n\nUse /help to see available commands.`
          }
        })
      }

      // Start onboarding
      discordOnboardingState.set(userId, { 
        step: "name", 
        userId: user.id, 
        selectedSkills: [] 
      })

      return NextResponse.json({
        type: 4,
        data: {
          content: `Welcome to SuperClaw! 🎉\n\nLet's set up your first AI agent.\n\n**What would you like to name your agent?**\n\n(Type your agent name in chat)`
        }
      })
    }

    // Handle /help command
    if (body.type === 2 && body.data?.name === "help") {
      return NextResponse.json({
        type: 4,
        data: {
          content: `**SuperClaw Commands:**\n\n` +
          `/start - Start onboarding or see status\n` +
          `/agents - List your agents\n` +
          `/help - Show this help message`
        }
      })
    }

    // Handle /agents command
    if (body.type === 2 && body.data?.name === "agents") {
      const userId = body.member?.user.id

      if (!userId) {
        return NextResponse.json({
          type: 4,
          data: { content: "Unable to identify your account." }
        })
      }

      const user = await prisma.user.findUnique({ 
        where: { discordId: userId },
        include: { agents: true }
      })

      if (!user || user.agents.length === 0) {
        return NextResponse.json({
          type: 4,
          data: { content: "You don't have any agents yet. Use /start to create one!" }
        })
      }

      const agentList = user.agents.map((a, i) => `${i + 1}. ${a.name} - ${a.status}`).join("\n")
      return NextResponse.json({
        type: 4,
        data: { content: `Your agents:\n\n${agentList}` }
      })
    }

    // Handle component interactions (select menus, buttons)
    if (body.type === 3) {
      const userId = body.member?.user.id
      const customId = body.data?.custom_id

      if (!userId) {
        return NextResponse.json({ type: 1 })
      }

      // Handle skills selection
      if (customId === "skills_select" && body.data?.options) {
        const state = discordOnboardingState.get(userId)
        
        if (!state || !state.userId) {
          return NextResponse.json({
            type: 4,
            data: { content: "Your session has expired. Please use /start again." }
          })
        }

        // Get selected skills from options
        const selectedSkills = body.data.options.map(o => o.value)
        
        // Show confirmation with selected skills
        const skillNames = selectedSkills.map(s => s.replace("skill_", "")).join(", ")

        return NextResponse.json({
          type: 4,
          data: {
            content: `Selected skills: ${skillNames}\n\nTo create your agent with these skills, click the button below.`,
            components: [
              {
                type: 1, // Action row
                components: [
                  {
                    type: 2, // Button
                    custom_id: "create_agent",
                    label: "Create Agent",
                    style: 1 // Primary
                  }
                ]
              }
            ]
          }
        })
      }

      // Handle create agent button
      if (customId === "create_agent") {
        const state = discordOnboardingState.get(userId)

        if (!state || !state.userId) {
          return NextResponse.json({
            type: 4,
            data: { content: "Your session has expired. Please use /start again." }
          })
        }

        // Get selected skills from the interaction
        // In a real implementation, you'd store this in a database
        // For now, we'll use default skills
        const skills = {
          messaging: true,
          calendar: false,
          slack: false,
          telegram: false,
          discord: true,
          content: true,
          seo: false,
          marketing: false,
          support: false,
          data: false,
          custom: false
        }

        const agent = await prisma.agent.create({
          data: {
            name: state.agentName || "My SuperClaw Agent",
            status: "active",
            userId: state.userId!,
            skills
          }
        })

        discordOnboardingState.delete(userId)

        return NextResponse.json({
          type: 4,
          data: {
            content: `🎉 Your agent "${agent.name}" is ready!\n\n` +
            `You can now interact with your agent. Check your dashboard for more details:\n${process.env.NEXT_PUBLIC_APP_URL || "https://superclaw.ai"}/dashboard`
          }
        })
      }

      return NextResponse.json({ type: 1 })
    }

    // Handle regular messages in onboarding mode
    if (body.type === 0) { // Message type
      // This would require Discord Message Content intent
      // For now, rely on slash commands
      return NextResponse.json({ type: 1 })
    }

    return NextResponse.json({ type: 1 })
  } catch (error) {
    console.error("Discord webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET for health check
export async function GET() {
  return NextResponse.json({ status: "ok", message: "Discord webhook endpoint" })
}
