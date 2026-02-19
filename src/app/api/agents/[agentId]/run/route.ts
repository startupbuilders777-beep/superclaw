import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { processAgentMessage } from '@/lib/agent-commander'

/**
 * POST /api/agents/[agentId]/run
 * Execute an agent with user input and return results
 * 
 * Request body:
 * {
 *   "input": "User message to process"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "response": "Agent's response",
 *   "agentId": "...",
 *   "timestamp": "..."
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { agentId } = await params
    const userId = session.user.id

    // Parse request body
    let body: { input?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const { input } = body

    if (!input || typeof input !== 'string' || !input.trim()) {
      return NextResponse.json(
        { error: 'Input is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Get the agent and verify ownership
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        userId: userId,
      },
    })

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Check if agent is active
    if (agent.status !== 'active' && agent.status !== 'running') {
      return NextResponse.json(
        { error: `Agent is not active. Current status: ${agent.status}. Please spawn the agent first.` },
        { status: 400 }
      )
    }

    // Process the message through the agent
    // The agent-commander handles rate limiting internally
    const response = await processAgentMessage(
      agentId,
      input.trim(),
      {
        source: 'telegram' as 'telegram' | 'discord', // Using telegram as default (for context only)
        sourceId: userId,
        userId: userId,
      }
    )

    return NextResponse.json({
      success: true,
      response,
      agentId: agent.id,
      agentName: agent.name,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('[AgentRun] Error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    
    // Provide more specific error messages
    if (errorMessage.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before sending more requests.' },
        { status: 429 }
      )
    }

    if (errorMessage.includes('API key') || errorMessage.includes('quota')) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process agent request' },
      { status: 500 }
    )
  }
}
