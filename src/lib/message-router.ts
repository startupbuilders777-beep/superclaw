import { prisma } from './prisma'
import { processAgentMessage } from './agent-commander'

// Source types for messaging platforms
export type MessageSource = 'telegram' | 'discord'

// Intent types for message routing
export type MessageIntent = 
  | 'general' 
  | 'content' 
  | 'seo' 
  | 'marketing' 
  | 'support' 
  | 'analytics' 
  | 'custom'

// Route incoming message to the appropriate agent
export async function routeMessage(
  source: MessageSource,
  sourceId: string,
  messageText: string
): Promise<{ success: boolean; agentId?: string; response?: string; error?: string }> {
  try {
    // Find user by their messaging platform ID
    const user = await prisma.user.findFirst({
      where: source === 'telegram' 
        ? { telegramId: sourceId }
        : { discordId: sourceId },
      include: {
        agents: {
          where: { status: 'active' },
        },
      },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found. Use /start to create an account.',
      }
    }

    // Check message limit
    if (user.messagesThisMonth >= user.messageLimit && user.subscriptionTier !== 'FREE') {
      return {
        success: false,
        error: 'Message limit reached. Upgrade your plan at /upgrade',
      }
    }

    // Find the best agent for this message
    const targetAgent = await findBestAgent(user.id, messageText)

    if (!targetAgent) {
      // No active agents - prompt user to configure one
      return {
        success: false,
        error: 'No active agents found. Use /start to create one!',
      }
    }

    // Process message through the agent
    const response = await processAgentMessage(targetAgent.id, messageText, {
      source,
      sourceId,
      userId: user.id,
    })

    // Increment message count
    await prisma.user.update({
      where: { id: user.id },
      data: { messagesThisMonth: { increment: 1 } },
    })

    return {
      success: true,
      agentId: targetAgent.id,
      response,
    }
  } catch (error) {
    console.error('[MessageRouter] Error routing message:', error)
    return {
      success: false,
      error: 'Failed to process message. Please try again.',
    }
  }
}

// Find the best agent based on message content and agent skills
async function findBestAgent(userId: string, messageText: string) {
  const agents = await prisma.agent.findMany({
    where: {
      userId,
      status: 'active',
    },
  })

  if (agents.length === 0) return null
  if (agents.length === 1) return agents[0]

  // Detect intent from message
  const intent = detectIntent(messageText)

  // Find agent with matching skills
  for (const agent of agents) {
    const skills = agent.skills as { type?: string } | null
    const agentType = skills?.type?.toLowerCase() || ''

    if (intent === 'general') {
      // For general messages, return first agent
      return agent
    }

    // Match intent to agent type
    if (
      (intent === 'content' && agentType.includes('content')) ||
      (intent === 'seo' && agentType.includes('seo')) ||
      (intent === 'marketing' && agentType.includes('marketing')) ||
      (intent === 'support' && agentType.includes('support')) ||
      (intent === 'analytics' && agentType.includes('analytics')) ||
      (intent === 'custom' && agentType.includes('custom'))
    ) {
      return agent
    }
  }

  // Default to first agent if no match
  return agents[0]
}

// Simple keyword-based intent detection
function detectIntent(text: string): MessageIntent {
  const lowerText = text.toLowerCase()

  // Content keywords
  const contentKeywords = ['write', 'post', 'blog', 'article', 'content', 'social media', 'tweet']
  if (contentKeywords.some(kw => lowerText.includes(kw))) {
    return 'content'
  }

  // SEO keywords
  const seoKeywords = ['seo', 'keyword', 'ranking', 'google', 'search', 'optimize']
  if (seoKeywords.some(kw => lowerText.includes(kw))) {
    return 'seo'
  }

  // Marketing keywords
  const marketingKeywords = ['marketing', 'ad', 'advertisement', 'campaign', 'email', 'copy']
  if (marketingKeywords.some(kw => lowerText.includes(kw))) {
    return 'marketing'
  }

  // Support keywords
  const supportKeywords = ['help', 'support', 'faq', 'question', 'issue', 'problem', 'ticket']
  if (supportKeywords.some(kw => lowerText.includes(kw))) {
    return 'support'
  }

  // Analytics keywords
  const analyticsKeywords = ['analytics', 'report', 'data', 'chart', 'stats', 'metrics']
  if (analyticsKeywords.some(kw => lowerText.includes(kw))) {
    return 'analytics'
  }

  return 'general'
}

// Send response back to the messaging platform
export async function sendResponse(
  source: MessageSource,
  sourceId: string,
  text: string
): Promise<void> {
  if (source === 'telegram') {
    await sendTelegramResponse(parseInt(sourceId), text)
  } else {
    await sendDiscordResponse(sourceId, text)
  }
}

async function sendTelegramResponse(chatId: number, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN || ''
  
  if (!token || token.startsWith('mock_')) {
    console.log('[Telegram Mock] Would send:', { chatId, text })
    return
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  })
}

async function sendDiscordResponse(channelId: string, text: string): Promise<void> {
  // Discord webhook or bot message implementation
  console.log('[Discord] Would send to channel:', channelId, text)
}
