import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Telegram Bot configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// Verify Telegram Webhook data using HMAC-SHA256
function verifyTelegramData(initData: string): boolean {
  if (!TELEGRAM_WEBHOOK_SECRET) return false;

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    params.delete("hash");

    // Sort parameters alphabetically
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const secretKey = crypto
      .createHash("sha256")
      .update(TELEGRAM_WEBHOOK_SECRET)
      .digest();
    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    return hmac === hash;
  } catch {
    return false;
  }
}

// Parse Telegram initData and extract user info
function parseTelegramData(initData: string) {
  const params = new URLSearchParams(initData);
  const userJson = params.get("user");
  if (!userJson) return null;
  
  try {
    return JSON.parse(decodeURIComponent(userJson));
  } catch {
    return null;
  }
}

// GET endpoint - redirect to Telegram bot for authentication
export async function GET(req: NextRequest) {
  const telegramBotUrl = `https://t.me/${process.env.TELEGRAM_BOT_NAME || "SuperClawBot"}?start=auth`;
  return NextResponse.redirect(telegramBotUrl);
}

// POST endpoint - handle Telegram webview authentication
export async function POST(req: NextRequest) {
  if (!TELEGRAM_BOT_TOKEN) {
    return NextResponse.json(
      { error: "Telegram OAuth not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { initData } = body;

    if (!initData) {
      return NextResponse.json(
        { error: "No initData provided" },
        { status: 400 }
      );
    }

    // Verify Telegram data
    if (!verifyTelegramData(initData)) {
      return NextResponse.json(
        { error: "Invalid Telegram data" },
        { status: 401 }
      );
    }

    // Parse user info from initData
    const telegramUser = parseTelegramData(initData);
    if (!telegramUser) {
      return NextResponse.json(
        { error: "Could not parse Telegram user" },
        { status: 400 }
      );
    }

    // Find or create user based on Telegram info
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { telegramId: String(telegramUser.id) },
          { email: telegramUser.email },
        ],
      },
    });

    if (!user) {
      // Create new user with Telegram info
      // Generate a placeholder email if not provided by Telegram
      const placeholderEmail = `telegram_${telegramUser.id}@superclaw.local`;
      user = await prisma.user.create({
        data: {
          name: telegramUser.first_name + (telegramUser.last_name ? ` ${telegramUser.last_name}` : ""),
          telegramId: String(telegramUser.id),
          email: placeholderEmail,
        },
      });
    } else if (!user.telegramId) {
      // Update existing user with Telegram ID
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramId: String(telegramUser.id),
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Telegram OAuth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
