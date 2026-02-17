import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";
import type { Stripe } from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Log the event
    await prisma.stripeEvent.create({
      data: {
        eventId: event.id,
        type: event.type,
        data: event.data.object as object,
        processed: true,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    
    // Log failed event
    await prisma.stripeEvent.create({
      data: {
        eventId: event.id,
        type: event.type,
        data: event.data.object as object,
        processed: false,
      },
    });

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier as "STARTER" | "PRO" | "AGENCY";
  
  if (!userId) {
    console.error("No userId in session metadata");
    return;
  }

  const subscriptionId = session.subscription as string;
  
  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
  
  // Map tier to message limits
  const tierLimits: Record<string, { messages: number; agents: number }> = {
    STARTER: { messages: 500, agents: 1 },
    PRO: { messages: -1, agents: 3 }, // -1 = unlimited
    AGENCY: { messages: -1, agents: 10 },
  };

  const limits = tierLimits[tier] || { messages: 0, agents: 0 };

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: subscriptionId,
      subscriptionTier: tier,
      subscriptionStatus: "ACTIVE",
      subscriptionEndDate: new Date(Number(subscription.current_period_end) * 1000),
      messageLimit: limits.messages,
    },
  });
}

async function handleSubscriptionUpdated(subscription: any) {
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!user) {
    console.error("No user found for subscription:", subscription.id);
    return;
  }

  // Determine tier from price ID
  const priceId = subscription.items.data[0]?.price.id;
  let tier: "STARTER" | "PRO" | "AGENCY" = "STARTER";
  
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) tier = "PRO";
  if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) tier = "AGENCY";

  // Map tier to message limits
  const tierLimits: Record<string, { messages: number; agents: number }> = {
    STARTER: { messages: 500, agents: 1 },
    PRO: { messages: -1, agents: 3 },
    AGENCY: { messages: -1, agents: 10 },
  };

  const limits = tierLimits[tier];

  // Map Stripe status to our status
  const statusMap: Record<string, SubscriptionStatus> = {
    active: "ACTIVE",
    canceled: "CANCELED",
    past_due: "PAST_DUE",
    trialing: "TRIALING",
    incomplete: "INCOMPLETE",
    incomplete_expired: "INCOMPLETE_EXPIRED",
  };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: tier,
      subscriptionStatus: statusMap[subscription.status] || "ACTIVE",
      subscriptionEndDate: new Date(Number(subscription.current_period_end) * 1000),
      messageLimit: limits.messages,
    },
  });
}

async function handleSubscriptionDeleted(subscription: any) {
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: "FREE",
      subscriptionStatus: "CANCELED",
      stripeSubscriptionId: null,
      messageLimit: 0,
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: invoice.customer as string },
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "PAST_DUE",
    },
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: invoice.customer as string },
  });

  if (!user) return;

  // Reset monthly message count on successful payment
  await prisma.user.update({
    where: { id: user.id },
    data: {
      messagesThisMonth: 0,
      subscriptionStatus: "ACTIVE",
    },
  });
}
