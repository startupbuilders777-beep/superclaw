import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-900 text-green-300"
    case "stopped":
      return "bg-gray-700 text-gray-300"
    case "pending":
      return "bg-yellow-900 text-yellow-300"
    case "error":
      return "bg-red-900 text-red-300"
    default:
      return "bg-gray-700 text-gray-300"
  }
}

function getHealthColor(health: string | null) {
  switch (health) {
    case "healthy":
      return "text-green-400"
    case "unhealthy":
      return "text-red-400"
    default:
      return "text-gray-400"
  }
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Get user with subscription data - using direct prisma query for demo
  const { prisma } = await import("@/lib/prisma")
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { agents: true },
  })

  if (!user) {
    redirect("/login")
  }

  const activeAgents = user.agents.filter((a: { status: string }) => a.status === "active").length
  const maxAgents = user.subscriptionTier === "AGENCY" ? 10 : user.subscriptionTier === "PRO" ? 3 : 1
  const messagesUnlimited = user.messageLimit === -1

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-white">
                SuperClaw
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
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-gray-400">Manage your AI agents and subscriptions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-gray-300">Active Agents</h3>
            <p className="mt-2 text-3xl font-bold text-white">{activeAgents}</p>
            <p className="mt-1 text-sm text-gray-500">of {maxAgents} allowed</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-gray-300">Messages This Month</h3>
            <p className="mt-2 text-3xl font-bold text-white">
              {messagesUnlimited ? "∞" : user.messagesThisMonth}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {messagesUnlimited ? "unlimited on Pro" : `of ${user.messageLimit} credits`}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-gray-300">Current Plan</h3>
            <p className="mt-2 text-3xl font-bold text-white">{user.subscriptionTier}</p>
            <Link href="/dashboard/subscription" className="mt-1 inline-block text-sm text-blue-500 hover:text-blue-400">
              Manage →
            </Link>
          </div>
        </div>

        {/* Agents Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Your Agents</h2>
            <Link href="/dashboard/agents" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors text-sm">
              + Create Agent
            </Link>
          </div>
          
          {user.agents.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-400 mb-4">You haven&apos;t created any agents yet.</p>
              <Link href="/dashboard/agents" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
                Create Your First Agent
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-750">
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Health</th>
                    <th className="px-6 py-3 font-medium">Skills</th>
                    <th className="px-6 py-3 font-medium">Last Check</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {user.agents.map((agent: { id: string; name: string; status: string; healthStatus: string | null; skills: unknown; lastHealthCheck: Date | null }) => {
                    const skills = agent.skills as Record<string, unknown> | null
                    const skillCount = skills ? Object.keys(skills).length : 0
                    
                    return (
                      <tr key={agent.id} className="hover:bg-gray-750 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-white font-medium">{agent.name}</div>
                          <div className="text-gray-500 text-sm">ID: {agent.id.slice(0, 8)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                            {agent.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={getHealthColor(agent.healthStatus)}>
                            {agent.healthStatus || "unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {skillCount > 0 ? (
                            <span>{skillCount} skill{skillCount !== 1 ? "s" : ""} configured</span>
                          ) : (
                            <span className="text-gray-500">Not configured</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {agent.lastHealthCheck ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(agent.lastHealthCheck) : "Never"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Link href="/dashboard/agents" className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors">
                              Configure
                            </Link>
                            <Link href="/dashboard/agents" className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors">
                              {agent.status === "active" ? "Stop" : "Start"}
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/skills" className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors text-center block">
              Configure Skills
            </Link>
            <Link href="/dashboard/subscription" className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors text-center block">
              Manage Subscription
            </Link>
            <Link href="/dashboard/prompt-templates" className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors text-center block">
              Prompt Templates
            </Link>
            <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
