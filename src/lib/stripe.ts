import Stripe from "stripe";

// Lazy initialization - only create Stripe instance if key exists
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-01-28.clover",
    typescript: true,
  });
}

export const stripe = {
  get instance() {
    return getStripe();
  }
};

// Price IDs configuration
export const PRICE_IDS = {
  STARTER: process.env.STRIPE_STARTER_PRICE_ID || "",
  PRO: process.env.STRIPE_PRO_PRICE_ID || "",
  AGENCY: process.env.STRIPE_AGENCY_PRICE_ID || "",
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
