# SuperClaw Vercel Environment Variables Setup

This document lists all environment variables that need to be configured in Vercel for SuperClaw production deployment.

## Required Environment Variables

### Database
| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |

### NextAuth
| Variable | Description | Example |
|----------|-------------|---------|
| NEXTAUTH_SECRET | Secret for NextAuth.js session encryption | Run: `openssl rand -base64 32` |
| NEXTAUTH_URL | Production URL | `https://superclaw.vercel.app` |
| NEXT_PUBLIC_APP_URL | Public app URL | `https://superclaw.vercel.app` |

### Discord Bot
| Variable | Description | Where to Get |
|----------|-------------|--------------|
| DISCORD_BOT_TOKEN | Discord bot token | Discord Developer Portal |
| DISCORD_CLIENT_ID | Discord OAuth app client ID | Discord Developer Portal |
| DISCORD_CLIENT_SECRET | Discord OAuth app client secret | Discord Developer Portal |

### Telegram Bot
| Variable | Description | Where to Get |
|----------|-------------|--------------|
| TELEGRAM_BOT_TOKEN | Telegram bot token | @BotFather on Telegram |
| TELEGRAM_WEBHOOK_SECRET | Secret for webhook verification | Generate your own |

### Stripe (Payments)
| Variable | Description | Where to Get |
|----------|-------------|--------------|
| STRIPE_SECRET_KEY | Stripe secret key | Stripe Dashboard |
| STRIPE_PUBLISHABLE_KEY | Stripe publishable key | Stripe Dashboard |
| STRIPE_WEBHOOK_SECRET | Stripe webhook signing secret | Stripe Dashboard |
| STRIPE_STARTER_PRICE_ID | Starter plan price ID | Stripe Dashboard |
| STRIPE_PRO_PRICE_ID | Pro plan price ID | Stripe Dashboard |
| STRIPE_AGENCY_PRICE_ID | Agency plan price ID | Stripe Dashboard |

### OpenAI
| Variable | Description | Where to Get |
|----------|-------------|--------------|
| OPENAI_API_KEY | OpenAI API key | OpenAI Platform |

### Rate Limiting (Optional)
| Variable | Description | Default |
|----------|-------------|---------|
| AGENT_RATE_LIMIT | Max requests per window | 50 |
| AGENT_RATE_LIMIT_WINDOW_MS | Window duration in ms | 60000 |

## How to Configure in Vercel

1. Go to Vercel Dashboard → superclaw project
2. Navigate to Settings → Environment Variables
3. Add each variable with appropriate values
4. Select "Production" as the environment
5. Click "Save"

## Verification

After configuring, verify:
```bash
curl https://superclaw.vercel.app/api/health
```

The response should show `"status":"success"` and `"database":"configured"`.
