import Link from "next/link"
import { auth } from "@/lib/auth"

// Force dynamic rendering
export const dynamic = "force-dynamic"

// Plan configuration - aligned with homepage
const plans = [
  {
    tier: "FREE",
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
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
    price: 9,
    features: [
      "1 AI Agent",
      "500 messages/day",
      "Basic analytics",
      "Email support",
      "Community support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    tier: "PRO",
    name: "Pro",
    description: "For professionals and teams",
    price: 29,
    features: [
      "3 AI Agents",
      "Unlimited messages",
      "Advanced analytics",
      "Priority support",
      "API access",
      "Custom prompts",
    ],
    cta: "Get Pro",
    popular: true,
  },
  {
    tier: "AGENCY",
    name: "Agency",
    description: "For agencies and enterprises",
    price: 99,
    features: [
      "10 AI Agents",
      "Unlimited messages",
      "Enterprise analytics",
      "24/7 priority support",
      "API access",
      "Custom prompts",
      "Team management",
      "Webhook notifications",
    ],
    cta: "Get Agency",
    popular: false,
  },
]

export default async function PricingPage() {
  const session = await auth()
  
  let userTier = "FREE"
  
  // Only fetch user tier if session exists - simplified to avoid build issues
  if (session?.user?.email) {
    try {
      const { default: prisma } = await import("@/lib/prisma")
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { subscriptionTier: true },
      })
      
      if (user) {
        userTier = user.subscriptionTier
      }
    } catch (e) {
      console.error("Error fetching user tier:", e)
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
                ) : plan.price > 0 ? (
                  <Link
                    href="/register"
                    className={`w-full py-3 px-4 rounded-lg font-medium text-center transition-colors block ${
                      plan.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
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
