import { NextRequest, NextResponse } from "next/server";

// Discord OAuth configuration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// Redirect to Discord OAuth
export async function GET(req: NextRequest) {
  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Discord OAuth not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId"); // Optional: associate with user

  // Discord OAuth scopes - identify and guilds for server access
  const scopes = [
    "identify",
    "email",
  ].join(" ");

  const redirectUri = `${NEXTAUTH_URL}/api/auth/discord/callback`;
  const state = userId || "anonymous";

  const discordAuthUrl = new URL("https://discord.com/oauth2/authorize");
  discordAuthUrl.searchParams.set("client_id", DISCORD_CLIENT_ID);
  discordAuthUrl.searchParams.set("scope", scopes);
  discordAuthUrl.searchParams.set("redirect_uri", redirectUri);
  discordAuthUrl.searchParams.set("response_type", "code");
  discordAuthUrl.searchParams.set("state", state);

  return NextResponse.redirect(discordAuthUrl.toString());
}
