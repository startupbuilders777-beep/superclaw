import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function HomePage() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">SuperClaw</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-5xl font-bold text-white mb-6">
          Your AI Agent, Instant Setup
        </h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          The simplest way for non-technical users to get their own AI agent.
          No coding required.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/register"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-medium transition-colors"
          >
            Start Free
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-lg font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  )
}
