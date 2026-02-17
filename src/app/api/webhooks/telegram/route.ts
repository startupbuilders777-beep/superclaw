import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Telegram Bot API URL (to be configured)
const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

interface TelegramUpdate {
  message?: {
    from?: {
      id: number
      first_name?: string
      last_name?: string
      username?: string
    }
    chat: {
      id: number
      type: string
    }
    text?: string
  }
  callback_query?: {
    from?: {
      id: number
      username?: string
    }
    data: string
    message?: {
      chat: {
        id: number
      }
    }
  }
}

// Send message to Telegram user
async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: object) {
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        reply_markup: replyMarkup
      })
    })
    return response.ok
  } catch (error) {
    console.error("Error sending Telegram message:", error)
    return false
  }
}

// Skills options for inline keyboard
const skillsKeyboard = {
  inline_keyboard: [
    [
      { text: "📝 Content Writing", callback_data: "skill_content" },
      { text: "🔍 SEO", callback_data: "skill_seo" }
    ],
    [
      { text: "📢 Marketing", callback_data: "skill_marketing" },
      { text: "💬 Support", callback_data: "skill_support" }
    ],
    [
      { text: "📊 Data Analysis", callback_data: "skill_data" },
      { text: "⚙️ Custom", callback_data: "skill_custom" }
    ],
    [
      { text: "✅ Done", callback_data: "onboarding_done" }
    ]
  ]
}

// Onboarding state storage (in production, use Redis or DB)
const onboardingState = new Map<number, {
  step: "start" | "name" | "skills" | "complete"
  userId?: string
  agentName?: string
  selectedSkills: string[]
}>()

export async function POST(request: Request) {
  try {
    // Verify webhook token
    const token = request.headers.get("x-telegram-bot-token")
    if (token !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: TelegramUpdate = await request.json()
    
    // Handle /start command
    if (body.message?.text?.startsWith("/start")) {
      const chatId = body.message.chat.id
      const telegramId = body.message.from?.id.toString()
      const username = body.message.from?.username

      // Check if user already exists
      let user = telegramId 
        ? await prisma.user.findUnique({ where: { telegramId } })
        : null

      if (!user && username) {
        user = await prisma.user.findFirst({ where: { name: username } })
      }

      if (user) {
        // User exists, check if they have agents
        const agents = await prisma.agent.findMany({ where: { userId: user.id } })
        
        if (agents.length > 0) {
          await sendTelegramMessage(
            chatId,
            `Welcome back, ${username || "there"}! 👋\n\nYou have ${agents.length} agent(s) configured.\n\nUse /help to see available commands.`
          )
        } else {
          // Start onboarding
          onboardingState.set(chatId, { step: "name", userId: user.id, selectedSkills: [] })
          await sendTelegramMessage(
            chatId,
            `Welcome to SuperClaw! 🎉\n\nLet's set up your first AI agent.\n\nWhat would you like to name your agent?`
          )
        }
      } else {
        // New user - direct to signup
        await sendTelegramMessage(
          chatId,
          `Welcome to SuperClaw! 🚀\n\nTo get started, please sign up on our website:\n\n${process.env.NEXT_PUBLIC_APP_URL || "https://superclaw.ai"}/register\n\nOnce you've created an account, come back here and type /start to set up your agent.`
        )
      }
      
      return NextResponse.json({ ok: true })
    }

    // Handle /help command
    if (body.message?.text === "/help") {
      const chatId = body.message.chat.id
      await sendTelegramMessage(
        chatId,
        `<b>SuperClaw Commands:</b>\n\n` +
        `/start - Start onboarding or see status\n` +
        `/agents - List your agents\n` +
        `/help - Show this help message`
      )
      return NextResponse.json({ ok: true })
    }

    // Handle /agents command
    if (body.message?.text === "/agents") {
      const chatId = body.message.chat.id
      const telegramId = body.message.from?.id.toString()
      
      if (!telegramId) {
        await sendTelegramMessage(chatId, "Unable to identify your account. Please sign up first.")
        return NextResponse.json({ ok: true })
      }

      const user = await prisma.user.findUnique({ 
        where: { telegramId },
        include: { agents: true }
      })

      if (!user || user.agents.length === 0) {
        await sendTelegramMessage(chatId, "You don't have any agents yet. Type /start to create one!")
      } else {
        const agentList = user.agents.map((a, i) => 
          `${i + 1}. ${a.name} - ${a.status}`
        ).join("\n")
        await sendTelegramMessage(chatId, `Your agents:\n\n${agentList}`)
      }
      
      return NextResponse.json({ ok: true })
    }

    // Handle callback queries (button clicks)
    if (body.callback_query) {
      const chatId = body.callback_query.message?.chat.id
      const callbackData = body.callback_query.data

      if (!chatId) {
        return NextResponse.json({ ok: true })
      }

      const state = onboardingState.get(chatId)

      if (callbackData === "onboarding_done" && state && state.userId) {
        // Create the agent with selected skills
        const skills = {
          messaging: state.selectedSkills.includes("skill_support"),
          calendar: false,
          slack: state.selectedSkills.includes("skill_marketing"),
          telegram: true,
          content: state.selectedSkills.includes("skill_content"),
          seo: state.selectedSkills.includes("skill_seo"),
          marketing: state.selectedSkills.includes("skill_marketing"),
          support: state.selectedSkills.includes("skill_support"),
          data: state.selectedSkills.includes("skill_data"),
          custom: state.selectedSkills.includes("skill_custom")
        }

        const agent = await prisma.agent.create({
          data: {
            name: state.agentName || "My SuperClaw Agent",
            status: "active",
            userId: state.userId,
            skills
          }
        })

        onboardingState.delete(chatId)

        await sendTelegramMessage(
          chatId,
          `🎉 Your agent "${agent.name}" is ready!\n\n` +
          `Selected skills: ${state.selectedSkills.map(s => s.replace("skill_", "")).join(", ")}\n\n` +
          `You can now interact with your agent. Check your dashboard for more details: ${process.env.NEXT_PUBLIC_APP_URL || "https://superclaw.ai"}/dashboard`
        )
      } else if (callbackData?.startsWith("skill_") && state) {
        // Toggle skill selection
        const skill = callbackData
        if (!state.selectedSkills.includes(skill)) {
          state.selectedSkills.push(skill)
        } else {
          state.selectedSkills = state.selectedSkills.filter(s => s !== skill)
        }
        onboardingState.set(chatId, state)

        const skillNames = state.selectedSkills.map(s => s.replace("skill_", ""))
        await sendTelegramMessage(
          chatId,
          `Selected skills: ${skillNames.join(", ")}\n\nClick more skills or press ✅ Done when finished.`,
          skillsKeyboard
        )
      }

      return NextResponse.json({ ok: true })
    }

    // Handle regular messages during onboarding
    if (body.message && !body.message.text?.startsWith("/")) {
      const chatId = body.message.chat.id
      const text = body.message.text
      const state = onboardingState.get(chatId)

      if (state?.step === "name") {
        // Get agent name from user
        state.agentName = text
        state.step = "skills"
        onboardingState.set(chatId, state)

        await sendTelegramMessage(
          chatId,
          `Great name: "${text}"! 🎯\n\nNow let's select skills for your agent. Choose from the options below:`,
          skillsKeyboard
        )
      } else if (state?.step === "skills") {
        await sendTelegramMessage(
          chatId,
          `Please use the buttons to select skills, or click ✅ Done when finished.`,
          skillsKeyboard
        )
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Telegram webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET for webhook verification
export async function GET() {
  return NextResponse.json({ status: "ok", message: "Telegram webhook endpoint" })
}
