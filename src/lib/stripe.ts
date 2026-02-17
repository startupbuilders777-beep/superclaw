import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
  typescript: true,
});

// Price IDs configuration
export const PRICE_IDS = {
  STARTER: process.env.STRIPE_STARTER_PRICE_ID!,
  PRO: process.env.STRIPE_PRO_PRICE_ID!,
  AGENCY: process.env.STRIPE_AGENCY_PRICE_ID!,
} as const;

export type SubscriptionTier = "STARTER" | "PRO" | "AGENCY";

export function getPriceIdForTier(tier: SubscriptionTier): string {
  return PRICE_IDS[tier];
}

export function getTierFromPriceId(priceId: string): SubscriptionTier | null {
  if (priceId === PRICE_IDS.STARTER) return "STARTER";
  if (priceId === PRICE_IDS.PRO) return "PRO";
  if (priceId === PRICE_IDS.AGENCY) return "AGENCY";
  return null;
}
