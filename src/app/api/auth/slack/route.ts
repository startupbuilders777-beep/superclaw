import { NextRequest, NextResponse } from "next/server";
import { getNextAuthUrl } from "@/lib/auth-url";

// Slack OAuth configuration
const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;

// Redirect to Slack OAuth
export async function GET(req: NextRequest) {
  if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Slack OAuth not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId"); // Optional: associate with user
  
  // Slack OAuth scopes
  const scopes = [
    "chat:write",
    "commands",
    "users:read",
    "team:read",
    "channels:read",
    "channels:manage",
    "groups:read",
    "incoming-webhook",
  ].join(",");

  const redirectUri = `${getNextAuthUrl()}/api/auth/slack/callback`;
  const state = userId || "anonymous";

  const slackAuthUrl = new URL("https://slack.com/oauth/v2/authorize");
  slackAuthUrl.searchParams.set("client_id", SLACK_CLIENT_ID);
  slackAuthUrl.searchParams.set("scope", scopes);
  slackAuthUrl.searchParams.set("redirect_uri", redirectUri);
  slackAuthUrl.searchParams.set("state", state);

  return NextResponse.redirect(slackAuthUrl.toString());
}
