import { NextRequest, NextResponse } from "next/server";
import { stripe, getPriceIdForTier, type SubscriptionTier } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        stripeCustomerId: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
      },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({
        tier: null,
        status: "inactive",
        currentPeriodEnd: null,
      });
    }

    // Get subscription details from Stripe
    if (!stripe.instance) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 503 }
      );
    }

    const subscriptions = await stripe.instance.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "all",
      limit: 1,
    });

    const subscription = subscriptions.data[0];

    return NextResponse.json({
      tier: user.subscriptionTier,
      status: user.subscriptionStatus || "inactive",
      currentPeriodEnd: user.subscriptionEndDate?.toISOString() || null,
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!stripe.instance) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { action } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    // Get current subscription
    const subscriptions = await stripe.instance.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "active",
      limit: 1,
    });

    const subscription = subscriptions.data[0] as any;

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    switch (action) {
      case "portal": {
        // Create customer portal session
        const portalSession = await stripe.instance.billingPortal.sessions.create({
          customer: user.stripeCustomerId,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        });

        return NextResponse.json({ url: portalSession.url });
      }

      case "cancel": {
        // Cancel at period end (no refund)
        await stripe.instance.subscriptions.update(subscription.id, {
          cancel_at_period_end: true,
        });

        return NextResponse.json({ 
          success: true, 
          message: "Subscription will be cancelled at the end of the billing period" 
        });
      }

      case "reactivate": {
        // Reactivate if cancelled
        await stripe.instance.subscriptions.update(subscription.id, {
          cancel_at_period_end: false,
        });

        return NextResponse.json({ 
          success: true, 
          message: "Subscription reactivated" 
        });
      }

      case "update": {
        // Upgrade/downgrade subscription
        const { newTier } = body;

        if (!newTier || !["STARTER", "PRO", "AGENCY"].includes(newTier)) {
          return NextResponse.json(
            { error: "Invalid tier. Must be STARTER, PRO, or AGENCY" },
            { status: 400 }
          );
        }

        const newPriceId = getPriceIdForTier(newTier as SubscriptionTier);

        if (!newPriceId) {
          return NextResponse.json(
            { error: "Price ID not configured for this tier" },
            { status: 400 }
          );
        }

        // Update subscription with proration
        await stripe.instance.subscriptions.update(subscription.id, {
          items: [{
            id: subscription.items.data[0].id,
            price: newPriceId,
          }],
          proration_behavior: "always_invoice",
        });

        // Update tier in database
        await prisma.user.update({
          where: { id: session.user.id },
          data: { subscriptionTier: newTier },
        });

        return NextResponse.json({ 
          success: true, 
          message: `Subscription updated to ${newTier}` 
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: portal, cancel, reactivate, or update" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Subscription action error:", error);
    return NextResponse.json(
      { error: "Failed to process subscription action" },
      { status: 500 }
    );
  }
}
