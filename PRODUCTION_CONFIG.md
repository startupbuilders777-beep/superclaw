# SuperClaw - Production Environment Configuration

## Required Environment Variables

For production deployment on Vercel, the following environment variables must be configured in the Vercel project settings:

### Stripe (Payment Processing)
| Variable | Description | Required |
|----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_live_...) | Yes |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (pk_live_...) | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret (whsec_...) | Yes |
| `STRIPE_STARTER_PRICE_ID` | Price ID for Starter tier ($9/mo) | Yes |
| `STRIPE_PRO_PRICE_ID` | Price ID for Pro tier ($29/mo) | Yes |
| `STRIPE_AGENCY_PRICE_ID` | Price ID for Agency tier ($99/mo) | Yes |

### Database
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |

### NextAuth (Authentication)
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | Production URL (https://...) | Yes |
| `NEXTAUTH_SECRET` | Secret for session encryption | Yes |

### Application
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APP_URL` | Public app URL | Yes |

### Telegram Bot
| Variable | Description | Required |
|----------|-------------|----------|
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from @BotFather | Yes |
| `TELEGRAM_WEBHOOK_SECRET` | Secret for verifying webhook requests | No |

### Discord Bot
| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_BOT_TOKEN` | Discord bot token | Yes |
| `DISCORD_CLIENT_ID` | Discord application client ID | Yes |
| `DISCORD_CLIENT_SECRET` | Discord application client secret | Yes |

### OpenAI (AI Agent Responses)
| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key (sk-...) | Yes |

## Setting Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable with the appropriate value
3. For production, use production values (not test keys)
4. Redeploy the application after adding variables

## GitHub Secrets (Optional)

For GitHub Actions deployments, add these secrets to your repository:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `STRIPE_SECRET_KEY`
- `TELEGRAM_BOT_TOKEN`
- `DISCORD_BOT_TOKEN`
- `OPENAI_API_KEY`
- etc.
