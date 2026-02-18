# SuperClaw - End-to-End Agent Test

**Date:** 2026-02-18
**Task:** ASANA-1213321768022759
**Status:** REQUIRES PRODUCTION DEPLOYMENT

## Test Requirements

### Prerequisites (Must be completed first)
1. ✅ API keys configured (completed in previous task)
2. ⬜ Production deployment with Docker running
3. ⬜ Database migrated and seeded
4. ⬜ Telegram bot created and configured
5. ⬜ OpenAI API key added to Vercel secrets

### Test Cases

#### Test 1: User Onboarding Flow
- [ ] User registers via /register
- [ ] User completes onboarding
- [ ] User selects subscription tier
- [ ] User selects skills
- [ ] Agent is created in database

#### Test 2: Agent Spawning
- [ ] User clicks "Start Agent" 
- [ ] Docker container spawns successfully
- [ ] Container appears in `docker ps`
- [ ] Agent status shows "active" in dashboard

#### Test 3: Telegram Integration
- [ ] User sends /start to Telegram bot
- [ ] Bot responds with welcome message
- [ ] User selects skill category
- [ ] Agent is linked to user's Telegram chat

#### Test 4: Agent Response
- [ ] User sends message to agent via Telegram
- [ ] Agent receives message
- [ ] Agent calls OpenAI API
- [ ] Agent responds with generated content

#### Test 5: Skills Applied
- [ ] Verify correct skill template used
- [ ] Verify prompt includes user's topics/preferences
- [ ] Verify response matches selected skill type

## Manual Testing Steps

```bash
# 1. Deploy to production
# (Via GitHub Actions or manually)

# 2. Check Docker containers running
docker ps | grep superclaw-agent

# 3. Check database
# Connect to production DB and verify tables exist

# 4. Test API endpoints
curl -X POST https://your-domain.com/api/agents/{agentId}/spawn \
  -H "Authorization: Bearer {token}"

# 5. Test Telegram webhook
# Send /start to your Telegram bot
```

## Known Issues / Notes

- This test requires full production environment setup
- API keys must be added to Vercel before testing
- Docker must be running on production server
- Telegram bot must be created via @BotFather

## Blockers

1. **Production not deployed** - Need to deploy first
2. **API keys not set** - Need to add real keys to Vercel
3. **Docker not configured** - Production server needs Docker
4. **Telegram bot not created** - Need to create and configure
