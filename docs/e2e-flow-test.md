# SuperClaw - End-to-End Flow Test Guide

**Date:** 2026-02-18
**Task:** ASANA-1213321841078033
**Status:** REQUIRES PRODUCTION

## Complete User Flow Test

This document outlines the complete end-to-end test for the SuperClaw platform.

### Prerequisites
Before testing, ensure:
- [ ] Production deployed with real API keys
- [ ] Telegram bot created and token added to Vercel
- [ ] OpenAI API key added to Vercel
- [ ] Database migrated
- [ ] Discord bot created (optional, for Discord flow)

---

## Test Scenarios

### Scenario 1: Telegram Signup Flow

**Objective:** Verify user can sign up via Telegram

**Steps:**
1. Find your Telegram bot (from @BotFather)
2. Send `/start` to the bot
3. Bot should respond with welcome message and skill options
4. User selects a skill (e.g., "Content Writer")
5. Bot prompts for focus topics
6. User enters topics (e.g., "AI, technology")
7. Bot confirms agent is ready
8. Check database: new User and Agent records created

**Expected Results:**
- [ ] /start command triggers onboarding
- [ ] Inline keyboard shows skill options
- [ ] After skill selection, prompt for topics appears
- [ ] Agent created with selected skills
- [ ] User can see agent in dashboard

**Verification Commands:**
```bash
# Check database for new user
psql $DATABASE_URL -c "SELECT * FROM users;"

# Check database for new agent  
psql $DATABASE_URL -c "SELECT * FROM agents;"
```

---

### Scenario 2: Agent Messaging Flow

**Objective:** Verify agent responds to messages via Telegram

**Steps:**
1. After signup, send a message to the bot
2. Message: "Write a post about AI"
3. Wait for response (should use OpenAI)
4. Verify response is relevant to skill type

**Expected Results:**
- [ ] Message received by webhook
- [ ] OpenAI API called with correct prompt
- [ ] Response sent back to Telegram
- [ ] Response is contextually appropriate

**Test Messages by Skill:**

| Skill | Test Message | Expected Response Type |
|-------|--------------|----------------------|
| Content Writer | "Write a blog post about AI" | Blog-style content |
| SEO Specialist | "How do I rank for AI keywords?" | SEO recommendations |
| Marketing | "Create ad copy for my SaaS" | Marketing copy |
| Customer Support | "I can't login" | Supportive response |
| Data Analyst | "Show me user stats" | Data-focused response |

---

### Scenario 3: Dashboard Integration

**Objective:** Verify dashboard shows agent status

**Steps:**
1. Sign up via Telegram
2. Visit dashboard at /dashboard
3. Login (should auto-create account from Telegram)
4. View agent list
5. Check agent details

**Expected Results:**
- [ ] User can login via Telegram-linked account
- [ ] Dashboard shows created agent
- [ ] Agent status shows "active"
- [ ] Skills displayed correctly

---

### Scenario 4: Agent Spawning

**Objective:** Verify Docker container spawns for agent

**Steps:**
1. From dashboard, click "Start Agent"
2. Check Docker containers
3. Verify container running

**Expected Results:**
- [ ] Spawn API called
- [ ] Docker container created
- [ ] Container appears in `docker ps`
- [ ] Agent status updated in database

**Verification Commands:**
```bash
# Check containers
docker ps | grep superclaw-agent

# Check agent status in DB
psql $DATABASE_URL -c "SELECT id, name, status, \"containerId\" FROM agents;"
```

---

### Scenario 5: Error Handling

**Objective:** Verify graceful error handling

**Tests:**
1. Send message with no API key configured → Should show config error
2. Exceed rate limit → Should show rate limit message
3. Invalid message → Should handle gracefully

**Expected Results:**
- [ ] Missing API key: "AI service not configured"
- [ ] Rate limit: "Rate limit exceeded"
- [ ] Invalid input: Proper error message

---

## Manual Test Checklist

```
□ Prerequisites Met
  □ Production deployed
  □ Telegram bot configured
  □ OpenAI API key set
  □ Database ready

□ Signup Flow
  □ /start command works
  □ Skill selection works
  □ Topics input works
  □ User created in DB
  □ Agent created in DB

□ Messaging Flow  
  □ Messages received
  □ OpenAI called
  □ Responses returned
  □ Correct skill context

□ Dashboard
  □ Login works
  □ Agents displayed
  □ Status accurate

□ Agent Spawning
  □ Container starts
  □ Status updates

□ Error Handling
  □ Config errors handled
  □ Rate limiting works
  □ Invalid input handled
```

---

## API Testing with curl

### Test Telegram Webhook
```bash
# Simulate Telegram update (local testing)
curl -X POST http://localhost:3000/api/webhooks/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "chat": {"id": 123456789},
      "text": "/start",
      "from": {"id": 123456789, "first_name": "Test"}
    }
  }'
```

### Test Agent Spawn
```bash
# Get auth token first, then:
curl -X POST https://your-domain.com/api/agents/{agentId}/spawn \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Blockers & Notes

- **Production not deployed**: Need deployment first
- **API keys not set**: Need real keys in Vercel
- **Docker not running**: Need Docker on production server
- **Telegram bot not created**: Need @BotFather setup

## Test Data

Use these for testing:
- **Test Skill**: Content Writer
- **Test Topics**: AI, technology, startups
- **Test Message**: "Write a short post about AI"
