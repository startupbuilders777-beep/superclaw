import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import prisma from "@/lib/prisma"

export default async function SubscriptionDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Get full user data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      agents: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  // Get tier limits
  const tierLimits: Record<string, { messages: number; agents: number; name: string }> = {
    FREE: { messages: 500, agents: 1, name: "Free" },
    STARTER: { messages: 5000, agents: 3, name: "Starter" },
    PRO: { messages: 50000, agents: 10, name: "Pro" },
    AGENCY: { messages: -1, agents: -1, name: "Agency" },
  }

  const currentLimit = tierLimits[user.subscriptionTier]
  const messagesUsed = user.messagesThisMonth
  const messagesRemaining = currentLimit.messages === -1 ? "∞" : Math.max(0, currentLimit.messages - messagesUsed)
  const agentsUsed = user.agents.length
  const agentsRemaining = currentLimit.agents === -1 ? "∞" : Math.max(0, currentLimit.agents - agentsUsed)
  const messagesPercent = currentLimit.messages === -1 ? 0 : Math.min(100, (messagesUsed / currentLimit.messages) * 100)
  const agentsPercent = currentLimit.agents === -1 ? 0 : Math.min(100, (agentsUsed / currentLimit.agents) * 100)

  // Format subscription end date
  const subscriptionEnd = user.subscriptionEndDate
    ? new Date(user.subscriptionEndDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-2xl font-bold text-white">
                SuperClaw
              </Link>
              <span className="text-gray-500">/</span>
              <Link href="/dashboard/subscription" className="text-gray-300 hover:text-white">
                Subscription
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-8 w-8 rounded-full"
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {session.user.name?.[0] || session.user.email?.[0] || "U"}
                  </div>
                )}
                <span className="text-gray-300">{session.user.name || session.user.email}</span>
              </div>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Subscription Management</h1>
          <p className="mt-2 text-gray-400">Manage your subscription, usage, and billing</p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Current Plan</h2>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">
                  {currentLimit.name}
                </span>
                {user.subscriptionStatus && (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.subscriptionStatus === "ACTIVE"
                        ? "bg-green-900 text-green-300"
                        : user.subscriptionStatus === "TRIALING"
                        ? "bg-yellow-900 text-yellow-300"
                        : user.subscriptionStatus === "PAST_DUE"
                        ? "bg-red-900 text-red-300"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {user.subscriptionStatus}
                  </span>
                )}
              </div>
              {subscriptionEnd && (
                <p className="mt-2 text-sm text-gray-400">
                  Renews on {subscriptionEnd}
                </p>
              )}
            </div>
            <Link
              href="/pricing"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Change Plan
            </Link>
          </div>
        </div>

        {/* Usage Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Messages Usage */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Messages This Month</h3>
              <span className="text-sm text-gray-400">
                {currentLimit.messages === -1 ? (
                  <span className="text-green-400">Unlimited</span>
                ) : (
                  <>
                    {messagesUsed.toLocaleString()} / {currentLimit.messages.toLocaleString()}
                  </>
                )}
              </span>
            </div>
            {currentLimit.messages === -1 ? (
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: "100%" }}
                />
              </div>
            ) : (
              <>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      messagesPercent > 90
                        ? "bg-red-500"
                        : messagesPercent > 75
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${messagesPercent}%` }}
                  />
                </div>
                {messagesPercent > 75 && (
                  <p className="text-sm text-yellow-400">
                    You&apos;ve used {Math.round(messagesPercent)}% of your monthly messages.{" "}
                    <Link href="/pricing" className="underline hover:text-yellow-300">
                      Upgrade
                    </Link>{" "}
                    for more.
                  </p>
                )}
              </>
            )}
          </div>

          {/* Agents Usage */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">AI Agents</h3>
              <span className="text-sm text-gray-400">
                {currentLimit.agents === -1 ? (
                  <span className="text-green-400">Unlimited</span>
                ) : (
                  <>
                    {agentsUsed} / {currentLimit.agents}
                  </>
                )}
              </span>
            </div>
            {currentLimit.agents === -1 ? (
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: "100%" }}
                />
              </div>
            ) : (
              <>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      agentsPercent > 90
                        ? "bg-red-500"
                        : agentsPercent > 75
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${agentsPercent}%` }}
                  />
                </div>
                {agentsPercent > 75 && (
                  <p className="text-sm text-yellow-400">
                    You&apos;ve used {Math.round(agentsPercent)}% of your agents.{" "}
                    <Link href="/pricing" className="underline hover:text-yellow-300">
                      Upgrade
                    </Link>{" "}
                    for more.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Plan Features */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-medium text-white mb-4">Your Plan Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-300">
                {currentLimit.agents === -1 ? "Unlimited AI Agents" : `${currentLimit.agents} AI Agent${currentLimit.agents > 1 ? "s" : ""}`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-300">
                {currentLimit.messages === -1 ? "Unlimited Messages" : `${currentLimit.messages.toLocaleString()} Messages/month`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-300">Basic Analytics</span>
            </div>
            {user.subscriptionTier !== "FREE" && (
              <>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">API Access</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">Priority Support</span>
                </div>
              </>
            )}
            {(user.subscriptionTier === "PRO" || user.subscriptionTier === "AGENCY") && (
              <>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">Custom Integrations</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">Webhook Notifications</span>
                </div>
              </>
            )}
            {user.subscriptionTier === "AGENCY" && (
              <>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">Dedicated Account Manager</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">SLA Guarantee</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Billing Information */}
        {user.stripeCustomerId && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Billing</h3>
            <p className="text-gray-400 text-sm mb-4">
              Manage your billing information and view invoices through Stripe.
            </p>
            <a
              href={`https://billing.stripe.com/p/login/${user.stripeCustomerId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              Open Stripe Billing Portal
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}
      </main>
    </div>
  )
}
