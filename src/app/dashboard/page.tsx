import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

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
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-8 w-8 rounded-full"
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
            <p className="mt-2 text-3xl font-bold text-white">0</p>
            <p className="mt-1 text-sm text-gray-500">of 3 allowed</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-gray-300">Messages This Month</h3>
            <p className="mt-2 text-3xl font-bold text-white">0</p>
            <p className="mt-1 text-sm text-gray-500">unlimited on Pro</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-gray-300">Current Plan</h3>
            <p className="mt-2 text-3xl font-bold text-white">Free</p>
            <Link href="#" className="mt-1 inline-block text-sm text-blue-500 hover:text-blue-400">
              Upgrade →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
              Create New Agent
            </button>
            <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors">
              View Documentation
            </button>
            <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
