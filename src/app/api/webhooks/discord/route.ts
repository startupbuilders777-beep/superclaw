import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { routeMessage } from '@/lib/message-router'

// Discord message types
interface DiscordMessage {
  id: string
  channel_id: string
  author: DiscordUser
  content: string
  timestamp: string
  webhook_id?: string
}

interface DiscordUser {
  id: string
  username: string
  bot?: boolean
}

interface DiscordInteraction {
  type: number
  d: {
    id?: string
    name?: string
    options?: { name: string; value: string }[]
    channel_id?: string
    user?: DiscordUser
    member?: { user: DiscordUser }
    custom_id?: string
  }
  member?: { user: DiscordUser }
  user?: DiscordUser
}

// Bot commands
const COMMANDS = {
  START: '/start',
  HELP: '/help',
  STATUS: '/status',
  UPGRADE: '/upgrade',
}

// Get environment variables
function getDiscordBotToken(): string {
  return process.env.DISCORD_BOT_TOKEN || ''
}

function getDiscordPublicKey(): string {
  return process.env.DISCORD_PUBLIC_KEY || ''
}

// Send message to Discord channel
async function sendDiscordMessage(
  channelId: string,
  text: string,
  components?: object
): Promise<void> {
  const token = getDiscordBotToken()
  if (!token) {
    console.log('[Discord Mock] Would send:', { channelId, text })
    return
  }

  const url = `https://discord.com/api/v10/channels/${channelId}/messages`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bot ${token}`,
    },
    body: JSON.stringify({
      content: text,
      components,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('[Discord] Send error:', error)
    throw new Error(`Discord API error: ${error}`)
  }
}

// Send welcome message with skill selection (as Discord embed)
async function sendWelcomeMessage(channelId: number, discordId: string): Promise<void> {
  const text = `🎉 **Welcome to SuperClaw!**

Your personal AI agent, instant setup.

**Choose your agent type:**

🖊️ **Content Writer** - Blog posts, social media, newsletters
🔍 **SEO Specialist** - Keyword research, optimization
📣 **Marketing** - Ad copy, emails, landing pages
💬 **Support** - Auto-reply, FAQs, ticket routing
📊 **Analytics** - Reports, data visualization
⚙️ **Custom** - Define your own prompts

Use the buttons below to select your agent type!`

  const components = [
    {
      type: 1, // ActionRow
      components: [
        {
          type: 2, // Button
          custom_id: 'skill_content',
          label: '🖊️ Content Writer',
          style: 1,
        },
        {
          type: 2,
          custom_id: 'skill_seo',
          label: '🔍 SEO Specialist',
          style: 1,
        },
        {
          type: 2,
          custom_id: 'skill_marketing',
          label: '📣 Marketing',
          style: 1,
        },
      ],
    },
    {
      type: 1,
      components: [
        {
          type: 2,
          custom_id: 'skill_support',
          label: '💬 Support',
          style: 1,
        },
        {
          type: 2,
          custom_id: 'skill_analytics',
          label: '📊 Analytics',
          style: 1,
        },
        {
          type: 2,
          custom_id: 'skill_custom',
          label: '⚙️ Custom',
          style: 1,
        },
      ],
    },
  ]

  // For DM channels, use channel_id; for guilds, we need the channel
  await sendDiscordMessage(String(channelId), text, components)
}

// Handle /start command
async function handleStartCommand(message: DiscordMessage): Promise<void> {
  const channelId = message.channel_id
  const discordId = message.author.id

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { discordId: String(discordId) },
    include: { agents: true },
  })

  if (existingUser) {
    // User exists - show status
    const agentCount = existingUser.agents.length
    const text = `👋 **Welcome back to SuperClaw!**

You have ${agentCount} agent${agentCount !== 1 ? 's' : ''} configured.

Want to add another agent? Just use /start again!
Or check /status for details.`

    await sendDiscordMessage(channelId, text)
  } else {
    // New user - create account and show welcome
    try {
      // Create new user with Discord
      const user = await prisma.user.create({
        data: {
          email: `discord_${discordId}@superclaw.ai`,
          name: message.author.username || 'Discord User',
          discordId: String(discordId),
          subscriptionTier: 'FREE',
          messageLimit: 0, // Free tier
        },
      })

      console.log(`[Discord] Created new user: ${user.id} (discord:${discordId})`)

      await sendWelcomeMessage(parseInt(channelId), discordId)
    } catch (error) {
      console.error('[Discord] Error creating user:', error)
      await sendDiscordMessage(
        channelId,
        '❌ Error creating your account. Please try again later.'
      )
    }
  }
}

// Handle skill selection via button interaction
async function handleSkillSelection(
  interactionId: string,
  customId: string,
  userId: string,
  channelId: string
): Promise<void> {
  // Map custom_id to skill names
  const skillMap: Record<string, string> = {
    skill_content: 'Content Writer',
    skill_seo: 'SEO Specialist',
    skill_marketing: 'Marketing',
    skill_support: 'Customer Support',
    skill_analytics: 'Data Analyst',
    skill_custom: 'Custom',
  }

  const skillName = skillMap[customId]
  if (!skillName) {
    await sendDiscordMessage(channelId, '❌ Invalid selection. Please try again.')
    return
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { discordId: String(userId) },
  })

  if (!user) {
    await sendDiscordMessage(channelId, '❌ User not found. Please use /start first.')
    return
  }

  // Create agent with selected skill
  const agent = await prisma.agent.create({
    data: {
      name: `${skillName} Agent`,
      status: 'pending',
      skills: {
        type: skillName,
        config: {},
      },
      userId: user.id,
    },
  })

  console.log(`[Discord] Created agent: ${agent.id} for user: ${user.id}`)

  const text = `✅ **${skillName} Agent Created!**

Your agent is being set up. You'll receive a message when it's ready!

What would you like your agent to focus on?

Or type /status anytime to check your agents.`

  await sendDiscordMessage(channelId, text)

  // Acknowledge the interaction
  const token = getDiscordBotToken()
  if (token) {
    await fetch(`https://discord.com/api/v10/interactions/${interactionId}/${customId}/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bot ${token}`,
      },
      body: JSON.stringify({
        type: 4, // ChannelMessageWithSource
        data: {
          content: `✅ You selected ${skillName}! Your agent is being created.`,
        },
      }),
    })
  }
}

// Handle /status command
async function handleStatusCommand(message: DiscordMessage): Promise<void> {
  const channelId = message.channel_id
  const discordId = message.author.id

  const user = await prisma.user.findUnique({
    where: { discordId: String(discordId) },
    include: { agents: true },
  })

  if (!user) {
    await sendDiscordMessage(channelId, "❌ You don't have an account yet. Use /start to create one!")
    return
  }

  const agentList = user.agents
    .map((agent, i) => {
      const status = agent.status === 'active' ? '🟢 Active' : '⚪ ' + agent.status
      const skills = (agent.skills as any)?.type || 'Not configured'
      return `${i + 1}. **${agent.name}** - ${status}\n   Skills: ${skills}`
    })
    .join('\n\n')

  const text = `📊 **Your SuperClaw Status**

**Account:** ${user.email}
**Plan:** ${user.subscriptionTier}

**Your Agents:**
${agentList || 'No agents yet. Use /start to create one!'}

**Usage:** ${user.messagesThisMonth} / ${user.messageLimit} messages this month`

  await sendDiscordMessage(channelId, text)
}

// Handle /help command
async function handleHelpCommand(message: DiscordMessage): Promise<void> {
  const channelId = message.channel_id

  const text = `❓ **SuperClaw Help**

**Commands:**
/start - Create account or add new agent
/status - View your account and agents
/upgrade - Upgrade your plan
/help - Show this help message

**How it works:**
1. Use /start to create your account
2. Pick an agent type that fits your needs
3. Configure what you want the agent to do
4. Your AI agent starts working 24/7!

Need help? Just ask!`

  await sendDiscordMessage(channelId, text)
}

// Discord webhook verification
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    message: 'Discord webhook endpoint. Use POST to send updates.',
  })
}

// Handle Discord messages and interactions
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()

    // Handle Discord interaction types
    const interactionType = body.type

    // Pong for verification
    if (interactionType === 1) {
      return NextResponse.json({ type: 1 })
    }

    // Handle button/slash command interaction (type 3 = MessageComponent, type 2 = ApplicationCommand)
    if (interactionType === 2 || interactionType === 3) {
      const interaction = body as DiscordInteraction
      const customId = interaction.d?.custom_id || ''
      const userId = interaction.d?.user?.id || interaction.member?.user?.id || ''
      const channelId = interaction.d?.channel_id || ''
      const interactionId = interaction.d?.id || ''

      // Handle skill selection buttons
      if (customId.startsWith('skill_')) {
        await handleSkillSelection(interactionId, customId, userId, channelId)
        return NextResponse.json({ ok: true })
      }

      return NextResponse.json({ ok: true })
    }

    // Handle message created (type 0)
    if (interactionType === 0 || !interactionType) {
      const message: DiscordMessage = body.d || body

      // Ignore bot messages
      if (message.author?.bot) {
        return NextResponse.json({ ok: true })
      }

      // Get user ID from the message author
      const discordId = message.author?.id || ''
      const text = message.content || ''
      const channelId = message.channel_id

      if (!discordId) {
        return NextResponse.json({ ok: true })
      }

      // Handle commands
      if (text.startsWith(COMMANDS.START)) {
        await handleStartCommand(message)
      } else if (text.startsWith(COMMANDS.HELP)) {
        await handleHelpCommand(message)
      } else if (text.startsWith(COMMANDS.STATUS)) {
        await handleStatusCommand(message)
      } else if (text.startsWith(COMMANDS.UPGRADE)) {
        await sendDiscordMessage(
          channelId,
          '🚀 To upgrade your plan, visit our pricing page:\n\nhttps://superclaw.ai/pricing'
        )
      } else {
        // Route message to agent
        const result = await routeMessage('discord', discordId, text)

        // Discord response handling
        if (result.success && result.response) {
          await sendDiscordMessage(channelId, result.response)
        } else if (result.error) {
          await sendDiscordMessage(channelId, result.error)
        }
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Discord Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
