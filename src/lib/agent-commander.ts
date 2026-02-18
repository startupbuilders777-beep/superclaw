import { prisma } from './prisma'
import OpenAI from 'openai'

// Lazy initialization of OpenAI client
function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.warn('[AgentCommander] OPENAI_API_KEY not configured')
    return null
  }
  return new OpenAI({ apiKey })
}

// Rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 50 // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

// Context for message processing
interface MessageContext {
  source: 'telegram' | 'discord'
  sourceId: string
  userId: string
}

// Process a message through an agent's container
export async function processAgentMessage(
  agentId: string,
  messageText: string,
  context: MessageContext
): Promise<string> {
  try {
    // Get agent details
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    })

    if (!agent) {
      throw new Error('Agent not found')
    }

    // Get agent's skills configuration
    const skills = agent.skills as { type?: string; config?: Record<string, any> } | null
    const agentType = skills?.type || 'General'
    const agentConfig = skills?.config || {}

    // Build prompt based on agent type
    const systemPrompt = buildSystemPrompt(agentType, agentConfig)

    // TODO: Replace with actual container communication
    // For now, simulate agent response
    const response = await simulateAgentResponse(agent, messageText, systemPrompt)

    return response
  } catch (error) {
    console.error('[AgentCommander] Error processing message:', error)
    return 'Sorry, I encountered an error processing your request. Please try again.'
  }
}

// Build system prompt based on agent type and configuration
function buildSystemPrompt(agentType: string, config: Record<string, any>): string {
  const basePrompts: Record<string, string> = {
    'Content Writer': `You are a professional content writer agent. Create engaging, well-structured content based on user requests. Focus on clarity, SEO best practices, and compelling storytelling.`,
    
    'SEO Specialist': `You are an SEO specialist agent. Help with keyword research, on-page optimization, backlink strategies, and improving search rankings. Provide data-driven recommendations.`,
    
    'Marketing': `You are a marketing expert agent. Create compelling ad copy, email sequences, landing page content, and marketing strategies. Focus on conversion and brand alignment.`,
    
    'Customer Support': `You are a customer support agent. Respond to inquiries helpfully, FAQ questions, and route tickets when needed. Be polite, patient, and accurate.`,
    
    'Data Analyst': `You are a data analyst agent. Help query data, generate reports, and create visualizations. Provide insights and actionable recommendations based on data.`,
    
    'Custom': `You are a custom AI agent. Follow the user's specific instructions and configuration. Adapt to their needs.`,
  }

  const basePrompt = basePrompts[agentType] || basePrompts['Custom']

  // Add custom configuration if provided
  if (config.focusTopics) {
    return `${basePrompt}\n\nFocus topics: ${config.focusTopics}`
  }

  return basePrompt
}

// Check rate limit for a user
function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize rate limit
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false
  }

  userLimit.count++
  return true
}

// Process agent message with real OpenAI
async function simulateAgentResponse(
  agent: any,
  messageText: string,
  systemPrompt: string
): Promise<string> {
  const userId = agent.userId

  // Check rate limit
  if (!checkRateLimit(userId)) {
    return 'Rate limit exceeded. Please wait a moment before sending more messages.'
  }

  // Get OpenAI client (lazy init)
  const openai = getOpenAIClient()
  if (!openai) {
    return 'Sorry, the AI service is not configured. Please contact support.'
  }

  try {
    // Call OpenAI with the agent's system prompt and user message
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use cost-effective model
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: messageText,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('No response from OpenAI')
    }

    console.log(`[AgentCommander] OpenAI response for agent ${agent.id}`)

    return response
  } catch (error: any) {
    console.error('[AgentCommander] OpenAI error:', error)

    // Handle specific error cases
    if (error.code === 'insufficient_quota') {
      return 'Sorry, the AI service is currently unavailable due to quota limits. Please contact support.'
    }

    if (error.code === 'invalid_api_key') {
      return 'Sorry, the AI service is not properly configured. Please contact support.'
    }

    return 'Sorry, I encountered an error processing your request. Please try again.'
  }
}

// Check if agent container is running
export async function isAgentContainerRunning(agentId: string): Promise<boolean> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
  })

  if (!agent || !agent.containerId) {
    return false
  }

  // TODO: Check actual container status via Docker API
  return agent.containerStatus === 'running'
}

// Start agent container
export async function startAgentContainer(agentId: string): Promise<string | null> {
  // TODO: Implement container startup
  console.log(`[AgentCommander] Starting container for agent ${agentId}`)
  return null
}

// Stop agent container
export async function stopAgentContainer(agentId: string): Promise<void> {
  // TODO: Implement container stop
  console.log(`[AgentCommander] Stopping container for agent ${agentId}`)
}
