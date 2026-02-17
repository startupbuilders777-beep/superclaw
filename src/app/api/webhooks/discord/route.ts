import { NextRequest, NextResponse } from 'next/server'
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

// Discord webhook verification
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    message: 'Discord webhook endpoint. Use POST to send updates.',
  })
}

// Handle Discord messages
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()

    // Handle Discord interaction types
    const interactionType = body.type

    // Pong for verification
    if (interactionType === 1) {
      return NextResponse.json({ type: 1 })
    }

    // Handle message created (type 0)
    if (interactionType === 0 || !interactionType) {
      const message: DiscordMessage = body.d

      // Ignore bot messages
      if (message.author.bot) {
        return NextResponse.json({ ok: true })
      }

      // Get user ID from the message author
      const discordId = message.author.id
      const text = message.content

      // Route message to agent
      const result = await routeMessage('discord', discordId, text)

      // Discord response handling
      if (result.success && result.response) {
        // For Discord, we'd typically use follow-up webhook or bot reply
        // For now, log the response
        console.log('[Discord] Would send response:', result.response)
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
