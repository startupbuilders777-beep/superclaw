import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNextAuthUrl } from "@/lib/auth-url";

// Discord OAuth configuration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;

export async function GET(req: NextRequest) {
  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Discord OAuth not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // userId if provided

  if (!code) {
    return NextResponse.redirect(`${getNextAuthUrl()}/login?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: `${getNextAuthUrl()}/api/auth/discord/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Discord token exchange failed:", await tokenResponse.text());
      return NextResponse.redirect(`${getNextAuthUrl()}/login?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from Discord
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      console.error("Discord user fetch failed:", await userResponse.text());
      return NextResponse.redirect(`${getNextAuthUrl()}/login?error=user_fetch_failed`);
    }

    const discordUser = await userResponse.json();

    // Find or create user based on Discord info
    // Use discordId as the unique identifier
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: discordUser.email },
          { discordId: discordUser.id },
        ],
      },
    });

    if (!user && discordUser.email) {
      // Create new user with Discord info
      user = await prisma.user.create({
        data: {
          email: discordUser.email,
          name: discordUser.username,
          discordId: discordUser.id,
        },
      });
    } else if (user && !user.discordId) {
      // Update existing user with Discord ID
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          discordId: discordUser.id,
        },
      });
    }

    if (!user) {
      return NextResponse.redirect(`${getNextAuthUrl()}/login?error=user_creation_failed`);
    }

    // Redirect to dashboard or onboarding with user info
    const redirectUrl = state && state !== "anonymous" 
      ? `${getNextAuthUrl()}/dashboard?oauth=discord`
      : `${getNextAuthUrl()}/onboarding?oauth=discord&userId=${user.id}`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Discord OAuth error:", error);
    return NextResponse.redirect(`${getNextAuthUrl()}/login?error=oauth_failed`);
  }
}
