import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { routeMessage } from '@/lib/message-router'

// Telegram message types
interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  edited_message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
}

interface TelegramMessage {
  message_id: number
  from?: TelegramUser
  chat: TelegramChat
  date: number
  text?: string
}

interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

interface TelegramChat {
  id: number
  type: 'private' | 'group' | 'supergroup' | 'channel'
  title?: string
  username?: string
  first_name?: string
  last_name?: string
}

interface TelegramCallbackQuery {
  id: string
  from: TelegramUser
  message?: TelegramMessage
  data?: string
}

// Bot commands
const COMMANDS = {
  START: '/start',
  HELP: '/help',
  STATUS: '/status',
  UPGRADE: '/upgrade',
  CANCEL: '/cancel',
}

// Get environment variables
function getTelegramToken(): string {
  return process.env.TELEGRAM_BOT_TOKEN || ''
}

function getWebhookSecret(): string {
  return process.env.TELEGRAM_WEBHOOK_SECRET || ''
}

// Send message back to Telegram
async function sendTelegramMessage(
  chatId: number,
  text: string,
  replyMarkup?: object
): Promise<void> {
  const token = getTelegramToken()
  if (!token || token.startsWith('mock_')) {
    console.log('[Telegram Mock] Would send:', { chatId, text })
    return
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      reply_markup: replyMarkup,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('[Telegram] Send error:', error)
    throw new Error(`Telegram API error: ${error}`)
  }
}

// Send welcome message with skill selection
async function sendWelcomeMessage(chatId: number, telegramId: number): Promise<void> {
  const text = `🎉 *Welcome to SuperClaw!*

Your personal AI agent, instant setup.

*Choose your agent type:*

🖊️ *Content Writer* - Blog posts, social media, newsletters
🔍 *SEO Specialist* - Keyword research, optimization
📣 *Marketing* - Ad copy, emails, landing pages
💬 *Support* - Auto-reply, FAQs, ticket routing
📊 *Analytics* - Reports, data visualization
⚙️ *Custom* - Define your own prompts

Just reply with your choice (e.g., "Content Writer" or "1")`

  const replyMarkup = {
    inline_keyboard: [
      [{ text: '🖊️ Content Writer', callback_data: 'skill_content' }],
      [{ text: '🔍 SEO Specialist', callback_data: 'skill_seo' }],
      [{ text: '📣 Marketing', callback_data: 'skill_marketing' }],
      [{ text: '💬 Support', callback_data: 'skill_support' }],
      [{ text: '📊 Analytics', callback_data: 'skill_analytics' }],
      [{ text: '⚙️ Custom', callback_data: 'skill_custom' }],
    ],
  }

  await sendTelegramMessage(chatId, text, replyMarkup)
}

// Handle /start command
async function handleStartCommand(message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id
  const telegramId = message.from?.id

  if (!telegramId) {
    await sendTelegramMessage(chatId, '❌ Could not identify user. Please try again.')
    return
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { telegramId: String(telegramId) },
    include: { agents: true },
  })

  if (existingUser) {
    // User exists - show status
    const agentCount = existingUser.agents.length
    const text = `👋 *Welcome back to SuperClaw!*

You have ${agentCount} agent${agentCount !== 1 ? 's' : ''} configured.

Want to add another agent? Just type /start again!
Or check /status for details.`

    await sendTelegramMessage(chatId, text)
  } else {
    // New user - create account and show welcome
    try {
      // Create new user with Telegram
      const user = await prisma.user.create({
        data: {
          email: `telegram_${telegramId}@superclaw.ai`,
          name: message.from?.first_name || 'Telegram User',
          telegramId: String(telegramId),
          subscriptionTier: 'FREE',
          messageLimit: 0, // Free tier
        },
      })

      console.log(`[Telegram] Created new user: ${user.id} (telegram:${telegramId})`)

      await sendWelcomeMessage(chatId, telegramId)
    } catch (error) {
      console.error('[Telegram] Error creating user:', error)
      await sendTelegramMessage(
        chatId,
        '❌ Error creating your account. Please try again later.'
      )
    }
  }
}

// Handle skill selection via callback query
async function handleSkillSelection(
  callbackQuery: TelegramCallbackQuery
): Promise<void> {
  const telegramId = callbackQuery.from.id
  const data = callbackQuery.data || ''
  const chatId = callbackQuery.message?.chat.id

  if (!chatId) return

  // Map callback data to skill names
  const skillMap: Record<string, string> = {
    skill_content: 'Content Writer',
    skill_seo: 'SEO Specialist',
    skill_marketing: 'Marketing',
    skill_support: 'Customer Support',
    skill_analytics: 'Data Analyst',
    skill_custom: 'Custom',
  }

  const skillName = skillMap[data]
  if (!skillName) {
    await sendTelegramMessage(chatId, '❌ Invalid selection. Please try again.')
    return
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { telegramId: String(telegramId) },
  })

  if (!user) {
    await sendTelegramMessage(chatId, '❌ User not found. Please use /start first.')
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

  console.log(`[Telegram] Created agent: ${agent.id} for user: ${user.id}`)

  const text = `✅ *${skillName} Agent Created!*

Your agent is being set up. You'll receive a message when it's ready!

What would you like your agent to focus on? (e.g., "Tech startups and AI news")

Or type /status anytime to check your agents.`

  await sendTelegramMessage(chatId, text)

  // Answer callback query to remove loading state
  const token = getTelegramToken()
  if (token && !token.startsWith('mock_')) {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQuery.id }),
    })
  }
}

// Handle /status command
async function handleStatusCommand(message: TelegramMessage): Promise<void> {
  const telegramId = message.from?.id
  const chatId = message.chat.id

  if (!telegramId) {
    await sendTelegramMessage(chatId, '❌ Could not identify user.')
    return
  }

  const user = await prisma.user.findUnique({
    where: { telegramId: String(telegramId) },
    include: { agents: true },
  })

  if (!user) {
    await sendTelegramMessage(chatId, "❌ You don't have an account yet. Use /start to create one!")
    return
  }

  const agentList = user.agents
    .map((agent: any, i: number) => {
      const status = agent.status === 'active' ? '🟢 Active' : '⚪ ' + agent.status
      const skills = (agent.skills as any)?.type || 'Not configured'
      return `${i + 1}. *${agent.name}* - ${status}\n   Skills: ${skills}`
    })
    .join('\n\n')

  const text = `📊 *Your SuperClaw Status*

*Account:* ${user.email}
*Plan:* ${user.subscriptionTier}

*Your Agents:*
${agentList || 'No agents yet. Use /start to create one!'}

*Usage:* ${user.messagesThisMonth} / ${user.messageLimit} messages this month`

  await sendTelegramMessage(chatId, text)
}

// Handle /help command
async function handleHelpCommand(message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id

  const text = `❓ *SuperClaw Help*

*Commands:*
/start - Create account or add new agent
/status - View your account and agents
/upgrade - Upgrade your plan
/help - Show this help message

*How it works:*
1. Use /start to create your account
2. Pick an agent type that fits your needs
3. Configure what you want the agent to do
4. Your AI agent starts working 24/7!

Need help? Just ask!`

  await sendTelegramMessage(chatId, text)
}

// Main webhook handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify webhook secret (optional but recommended)
    const secret = request.headers.get('x-telegram-bot-api-secret-token')
    const expectedSecret = getWebhookSecret()

    if (expectedSecret && expectedSecret !== 'your_webhook_secret_here' && secret !== expectedSecret) {
      console.warn('[Telegram] Invalid webhook secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: TelegramUpdate = await request.json()

    // Handle callback query (inline keyboard button press)
    if (body.callback_query) {
      await handleSkillSelection(body.callback_query)
      return NextResponse.json({ ok: true })
    }

    // Handle message
    if (body.message) {
      const text = body.message.text || ''

      // Handle commands
      if (text.startsWith(COMMANDS.START)) {
        await handleStartCommand(body.message)
      } else if (text.startsWith(COMMANDS.HELP)) {
        await handleHelpCommand(body.message)
      } else if (text.startsWith(COMMANDS.STATUS)) {
        await handleStatusCommand(body.message)
      } else if (text.startsWith(COMMANDS.UPGRADE)) {
        const chatId = body.message.chat.id
        await sendTelegramMessage(
          chatId,
          '🚀 To upgrade your plan, visit our pricing page:\n\nhttps://superclaw.ai/pricing'
        )
      } else if (text.startsWith(COMMANDS.CANCEL)) {
        // Handle cancel command
        const chatId = body.message.chat.id
        await sendTelegramMessage(chatId, 'Operation cancelled. What else can I help you with?')
      } else {
        // Route message to agent
        const telegramId = body.message.from?.id
        const chatId = body.message.chat.id
        
        if (telegramId) {
          const result = await routeMessage('telegram', String(telegramId), text)
          
          if (result.success && result.response) {
            await sendTelegramMessage(chatId, result.response)
          } else if (result.error) {
            await sendTelegramMessage(chatId, result.error)
          }
        }
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true, message: 'No message to process' })
  } catch (error) {
    console.error('[Telegram Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET handler for webhook verification
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    message: 'Telegram webhook endpoint. Use POST to send updates.',
  })
}
