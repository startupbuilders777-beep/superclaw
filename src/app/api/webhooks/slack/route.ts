import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET

// Verify Slack request signature
function verifySlackRequest(
  req: NextRequest,
  body: string
): boolean {
  if (!SLACK_SIGNING_SECRET) {
    // In development without secret, allow all requests
    console.warn("SLACK_SIGNING_SECRET not set - skipping verification")
    return true
  }

  const signature = req.headers.get("x-slack-signature")
  const timestamp = req.headers.get("x-slack-request-timestamp")

  if (!signature || !timestamp) {
    return false
  }

  // Check if request is too old (5 minutes)
  const currentTime = Math.floor(Date.now() / 1000)
  if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
    return false
  }

  // Generate signature
  const baseString = `v0:${timestamp}:${body}`
  const hmac = crypto
    .createHmac("sha256", SLACK_SIGNING_SECRET)
    .update(baseString)
    .digest("hex")
  const expectedSignature = `v0=${hmac}`

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

// Handle Slack slash commands
export async function POST(req: NextRequest) {
  const body = await req.text()

  // Verify request is from Slack
  if (!verifySlackRequest(req, body)) {
    return NextResponse.json(
      { error: "Invalid Slack request" },
      { status: 401 }
    )
  }

  // Parse form-encoded body
  const params = new URLSearchParams(body)
  const command = params.get("command")
  const text = params.get("text")
  const userId = params.get("user_id")
  const userName = params.get("user_name")
  const channelId = params.get("channel_id")
  const channelName = params.get("channel_name")
  const teamId = params.get("team_id")
  const responseUrl = params.get("response_url")

  console.log("Slack command:", command, text)

  // Log the command
  await prisma.slackCommand.create({
    data: {
      command: command || "",
      userId: userId || null,
      channelId: channelId || null,
      teamId: teamId || null,
    },
  })

  // Handle different commands
  let responseText = ""
  let responseBlocks = null

  switch (command) {
    case "/superclaw":
    case "/agent": {
      // Parse command: /superclaw status [agent-name]
      const parts = (text || "").trim().split(" ")
      const subCommand = parts[0]?.toLowerCase()
      const agentName = parts.slice(1).join(" ")

      if (subCommand === "help" || !subCommand) {
        responseText = "SuperClaw Agent Commands:"
        responseBlocks = [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*SuperClaw Agent Commands*\n\n" +
                "• `/superclaw status` - List all agents and their status\n" +
                "• `/superclaw status <agent-name>` - Get status of specific agent\n" +
                "• `/superclaw usage` - Show usage stats\n" +
                "• `/superclaw help` - Show this help message",
            },
          },
        ]
      } else if (subCommand === "status") {
        if (agentName) {
          // Get specific agent
          const agent = await prisma.agent.findFirst({
            where: { name: agentName },
            include: { user: true },
          })

          if (agent) {
            responseText = `Agent: ${agent.name}\nStatus: ${agent.status}\nCreated: ${agent.createdAt.toLocaleDateString()}`
            responseBlocks = [
              {
                type: "section",
                fields: [
                  {
                    type: "mrkdwn",
                    text: `*Agent:*\n${agent.name}`,
                  },
                  {
                    type: "mrkdwn",
                    text: `*Status:*\n${agent.status}`,
                  },
                  {
                    type: "mrkdwn",
                    text: `*Owner:*\n${agent.user?.name || agent.user?.email || "Unknown"}`,
                  },
                ],
              },
            ]
          } else {
            responseText = `Agent "${agentName}" not found`
          }
        } else {
          // List all agents for this user
          const user = userId ? await prisma.user.findFirst({ where: { name: userName || undefined } }) : null
          
          const agents = user 
            ? await prisma.agent.findMany({
                where: { userId: user.id },
                take: 10,
                orderBy: { createdAt: "desc" },
              })
            : await prisma.agent.findMany({
                take: 10,
                orderBy: { createdAt: "desc" },
              })

          if (agents.length > 0) {
            const agentList = agents
              .map((a) => `• ${a.name} - ${a.status}`)
              .join("\n")
            responseText = "Your Agents:"
            responseBlocks = [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*Your Agents:*\n${agentList}`,
                },
              },
            ]
          } else {
            responseText = "You don't have any agents yet. Create one at the dashboard!"
          }
        }
      } else if (subCommand === "usage") {
        responseText = "Usage tracking coming soon!"
      } else {
        responseText = `Unknown command: ${subCommand}. Type /superclaw help for available commands.`
      }
      break
    }

    default:
      responseText = `Unknown command: ${command}. Try /superclaw help`
  }

  // Send response
  return NextResponse.json({
    response_type: "ephemeral",
    text: responseText,
    blocks: responseBlocks,
  })
}

// GET for health check
export async function GET() {
  return NextResponse.json({ status: "ok", message: "Slack webhook endpoint" })
}
