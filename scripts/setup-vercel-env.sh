#!/bin/bash
# SuperClaw Vercel Environment Setup Script
# Usage: ./scripts/setup-vercel-env.sh VERCEL_TOKEN

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <VERCEL_TOKEN>"
  exit 1
fi

VERCEL_TOKEN="$1"
PROJECT_ID="prj_zimKel1JnRB2SQTXjfSVraz64eOn"

echo "Setting up SuperClaw environment variables in Vercel..."

add_env() {
  local name="$1"
  local value="$2"
  local env="$3"
  
  if [ -z "$value" ]; then
    echo "Skipping $name (no value)"
    return
  fi
  
  echo "Adding $name..."
  curl -s -X POST "https://api.vercel.com/v6/projects/$PROJECT_ID/env" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"key\": \"$name\", \"value\": \"$value\", \"target\": [\"$env\"], \"type\": \"plain\"}" \
    | jq -r '.key // .error.message // .message' 2>/dev/null || echo "Added"
}

[ -f .env.production ] && source .env.production

add_env "DATABASE_URL" "$DATABASE_URL" "production"
add_env "NEXTAUTH_SECRET" "$NEXTAUTH_SECRET" "production"
add_env "NEXTAUTH_URL" "$NEXTAUTH_URL" "production"
add_env "NEXT_PUBLIC_APP_URL" "$NEXT_PUBLIC_APP_URL" "production"
add_env "DISCORD_CLIENT_ID" "$DISCORD_CLIENT_ID" "production"
add_env "DISCORD_CLIENT_SECRET" "$DISCORD_CLIENT_SECRET" "production"
add_env "DISCORD_BOT_TOKEN" "$DISCORD_BOT_TOKEN" "production"
add_env "TELEGRAM_BOT_TOKEN" "$TELEGRAM_BOT_TOKEN" "production"
add_env "TELEGRAM_WEBHOOK_SECRET" "$TELEGRAM_WEBHOOK_SECRET" "production"
add_env "OPENAI_API_KEY" "$OPENAI_API_KEY" "production"
add_env "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY" "production"
add_env "STRIPE_PUBLISHABLE_KEY" "$STRIPE_PUBLISHABLE_KEY" "production"
add_env "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET" "production"
add_env "STRIPE_STARTER_PRICE_ID" "$STRIPE_STARTER_PRICE_ID" "production"
add_env "STRIPE_PRO_PRICE_ID" "$STRIPE_PRO_PRICE_ID" "production"
add_env "STRIPE_AGENCY_PRICE_ID" "$STRIPE_AGENCY_PRICE_ID" "production"

echo "Done! Run: vercel --prod --token $VERCEL_TOKEN"
