import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getNextAuthUrl } from "@/lib/auth-url";

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;

// Handle Slack OAuth callback
export async function GET(req: NextRequest) {
  if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Slack OAuth not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // userId or "anonymous"
  const error = searchParams.get("error");

  if (error) {
    console.error("Slack OAuth error:", error);
    return NextResponse.redirect(`${getNextAuthUrl()}/dashboard?error=slack_auth_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${getNextAuthUrl()}/dashboard?error=missing_code`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID!,
        client_secret: SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: `${getNextAuthUrl()}/api/auth/slack/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      console.error("Slack token exchange failed:", tokenData);
      return NextResponse.redirect(`${getNextAuthUrl()}/dashboard?error=slack_token_failed`);
    }

    const {
      access_token: botToken,
      bot_user_id: botUserId,
      team: { id: teamId, name: teamName },
      authed_user: authedUser,
    } = tokenData;

    // If userId was passed in state, associate with that user
    if (state && state !== "anonymous") {
      // Update user with Slack info
      await prisma.user.update({
        where: { id: state },
        data: {
          slackId: authedUser?.id,
          slackTeamId: teamId,
        },
      });
    }

    // Store Slack workspace connection
    await prisma.slackWorkspace.upsert({
      where: { slackTeamId: teamId },
      create: {
        slackTeamId: teamId,
        slackTeamName: teamName,
        slackBotToken: botToken,
        slackBotUserId: botUserId,
        userId: state && state !== "anonymous" ? state : null,
        isActive: true,
      },
      update: {
        slackTeamName: teamName,
        slackBotToken: botToken,
        slackBotUserId: botUserId,
        isActive: true,
        userId: state && state !== "anonymous" ? state : undefined,
      },
    });

    // Redirect to dashboard with success
    return NextResponse.redirect(`${getNextAuthUrl()}/dashboard?success=slack_connected`);
  } catch (error) {
    console.error("Slack OAuth callback error:", error);
    return NextResponse.redirect(`${getNextAuthUrl()}/dashboard?error=slack_oauth_error`);
  }
}
