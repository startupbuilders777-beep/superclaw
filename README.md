# SuperClaw - No-Code AI Agent Platform

**"Your AI Agent, Instant Setup"**

The simplest way for non-technical users to get their own AI agent. No SSH, no VM, no technical setup. Just sign up → Pick skills → Agent works 24/7.

---

## Vision

Zero setup AI agents for marketers, builders, designers. TikTok-friendly: "Your personal AI employee in 30 seconds — $9/month"

---

## Features

### Authentication
- **Telegram OAuth** - Sign up via `/start` command on Telegram
- **Discord OAuth** - Sign up via Discord bot
- **Slack OAuth** - Sign up via Slack app
- **Email/Password** - Traditional registration via NextAuth.js

### Agent Management
- **One-click Agent Provisioning** - Automatic Docker container creation per agent
- **Skill Configuration** - Drag-drop skill selection UI
- **Agent Status Control** - Start, stop, restart agents
- **Cron Scheduling** - Schedule agent tasks hourly, daily, weekly

### Skills Packs
- Content Writer - Blog posts, social media, newsletters
- SEO Specialist - Keyword research, optimization
- Marketing Copy - Ad copy, emails, landing pages
- Customer Support - Auto-reply, FAQs, ticket routing
- Data Analyst - Reports, data visualization
- Custom - Define your own prompts

### Dashboard
- Agent management (create, configure, start, stop)
- Skill selection and configuration
- Prompt template editor
- Team management (Agency tier)
- Subscription management
- Usage tracking

---

## Tech Stack

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Prisma ORM
- **Database:** PostgreSQL (via Prisma)
- **Authentication:** NextAuth.js (Discord, Telegram, Slack, Credentials)
- **Payments:** Stripe Checkout
- **Containerization:** Docker (per-user agent isolation)
- **Deployment:** Vercel (frontend) + Docker (agent containers)

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Docker (for agent containers)
- Telegram Bot Token (for Telegram integration)
- Discord Application (for Discord OAuth)
- Slack App (for Slack integration)
- Stripe Account (for payments)

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
TELEGRAM_BOT_TOKEN=""
SLACK_CLIENT_ID=""
SLACK_CLIENT_SECRET=""

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Agent Containers
AGENT_CONTAINER_IMAGE="openclaw/agent:latest"
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

### Build

```bash
npm run build
```

---

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── agents/       # Agent CRUD operations
│   │   ├── auth/        # Authentication routes
│   │   ├── skills/      # Skills configuration
│   │   ├── webhooks/    # Telegram, Discord, Slack, Stripe
│   │   └── checkout/    # Stripe checkout
│   ├── dashboard/       # Protected dashboard pages
│   ├── onboarding/      # User onboarding flow
│   └── page.tsx         # Landing page
├── components/          # React components
├── lib/                 # Utilities (Prisma, auth, etc.)
└── middleware.ts        # Auth protection
```

---

## API Endpoints

### Agents
- `GET /api/agents` - List user's agents
- `POST /api/agents` - Create new agent
- `GET /api/agents/[id]` - Get agent details
- `PUT /api/agents/[id]` - Update agent
- `DELETE /api/agents/[id]` - Delete agent
- `POST /api/agents/[id]/spawn` - Start agent container
- `DELETE /api/agents/[id]/spawn` - Stop agent container
- `PUT /api/agents/[id]/skills` - Configure agent skills
- `PUT /api/agents/[id]/schedule` - Set agent schedule

### Skills
- `GET /api/skills` - List all available skills
- `GET /api/skills/[category]` - List skills by category

### Webhooks
- `POST /api/webhooks/telegram` - Telegram bot updates
- `POST /api/webhooks/discord` - Discord bot events
- `POST /api/webhooks/slack` - Slack events
- `POST /api/webhooks/stripe` - Stripe events

---

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Starter** | $9/mo | 1 agent, 500 msgs/day |
| **Pro** | $29/mo | 3 agents, unlimited msgs |
| **Agency** | $99/mo | 10 agents, team, priority |

---

## License

Proprietary - All rights reserved
