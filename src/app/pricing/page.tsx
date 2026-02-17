import { loadStripe } from "@stripe/stripe-js"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Plan configuration
const plans = [
  {
    tier: "FREE",
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    priceId: null,
    features: [
      "1 AI Agent",
      "500 messages/month",
      "Basic analytics",
      "Email support",
    ],
    cta: "Current Plan",
    popular: false,
  },
  {
    tier: "STARTER",
    name: "Starter",
    description: "For individuals and small projects",
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: [
      "3 AI Agents",
      "5,000 messages/month",
      "Advanced analytics",
      "Priority email support",
      "API access",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    tier: "PRO",
    name: "Pro",
    description: "For professionals and teams",
    price: 79,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "10 AI Agents",
      "Unlimited messages",
      "Advanced analytics",
      "Priority support",
      "API access",
      "Custom integrations",
      "Webhook notifications",
    ],
    cta: "Get Pro",
    popular: true,
  },
  {
    tier: "AGENCY",
    name: "Agency",
    description: "For agencies and enterprises",
    price: 199,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID,
    features: [
      "Unlimited AI Agents",
      "Unlimited messages",
      "Enterprise analytics",
      "24/7 phone support",
      "API access",
      "Custom integrations",
      "Webhooks",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

async function handleCheckout(tier: string, priceId: string | null) {
  "use server"
  
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  })

  if (!user) {
    redirect("/login")
  }

  // Call checkout API
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tier,
      userId: user.id,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    }),
  })

  const { url, error } = await response.json()

  if (error) {
    console.error("Checkout error:", error)
    return
  }

  if (url) {
    redirect(url)
  }
}

export default async function PricingPage() {
  const session = await auth()
  
  let userTier = "FREE"
  let userSubscriptionStatus = null
  
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { subscriptionTier: true, subscriptionStatus: true },
    })
    
    if (user) {
      userTier = user.subscriptionTier
      userSubscriptionStatus = user.subscriptionStatus
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-white">
                SuperClaw
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Pricing Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const isCurrentPlan = userTier === plan.tier
            
            return (
              <div
                key={plan.tier}
                className={`relative bg-gray-800 rounded-2xl border ${
                  plan.popular
                    ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-50"
                    : "border-gray-700"
                } p-8 flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-400">/month</span>
                  )}
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-gray-700 text-gray-400 rounded-lg font-medium cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : plan.priceId ? (
                  <form action={handleCheckout.bind(null, plan.tier, plan.priceId)}>
                    <button
                      type="submit"
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        plan.popular
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-white"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/register"
                    className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium text-center transition-colors block"
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-400 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes
                take effect immediately and billing is prorated.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-2">
                What happens to my data if I cancel?
              </h3>
              <p className="text-gray-400 text-sm">
                Your data remains accessible for 30 days after cancellation. You
                can export your data at any time before then.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-400 text-sm">
                Yes, we offer a 7-day money-back guarantee. If you&apos;re not
                satisfied, contact support for a full refund.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-400 text-sm">
                We accept all major credit cards, debit cards, and some regional
                payment methods through Stripe.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
