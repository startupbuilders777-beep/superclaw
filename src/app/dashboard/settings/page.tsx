import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth/password"
import { revalidatePath } from "next/cache"

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Get user with accounts (OAuth connections)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      accounts: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  const hasPassword = !!user.password
  const connectedAccounts = user.accounts.map((account) => ({
    provider: account.provider,
    providerAccountId: account.providerAccountId,
  }))

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
              <nav className="ml-10 flex items-center gap-4">
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Agents
                </Link>
                <Link href="/dashboard/skills" className="text-gray-300 hover:text-white transition-colors">
                  Skills
                </Link>
                <Link href="/dashboard/subscription" className="text-gray-300 hover:text-white transition-colors">
                  Subscription
                </Link>
                <Link href="/dashboard/settings" className="text-white font-medium">
                  Settings
                </Link>
              </nav>
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
                  const { signOut } = await import("@/lib/auth")
                  await signOut()
                }}
              >
                <button
                  type="submit"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        {/* Profile Section */}
        <section className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Profile</h2>
          <form action={updateProfile} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={user.name || ""}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              Save Changes
            </button>
          </form>
        </section>

        {/* Connected Accounts Section */}
        <section className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Connected Accounts</h2>
          <div className="space-y-3">
            {connectedAccounts.length > 0 ? (
              connectedAccounts.map((account) => (
                <div
                  key={account.provider}
                  className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                      {account.provider === "discord" && (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                      )}
                      {account.provider === "telegram" && (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                        </svg>
                      )}
                      {account.provider === "slack" && (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-white capitalize">{account.provider}</span>
                    <span className="text-gray-400 text-sm">Connected</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 py-3">No connected accounts</p>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Connect additional accounts via OAuth on the login page
          </p>
        </section>

        {/* Password Section */}
        <section className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Password</h2>
          {hasPassword ? (
            <form action={changePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  required
                  minLength={8}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  minLength={8}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              >
                Change Password
              </button>
            </form>
          ) : (
            <div>
              <p className="text-gray-300 mb-4">You don't have a password set.</p>
              <Link
                href="/login"
                className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-medium transition-colors"
              >
                Set Password
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

async function updateProfile(formData: FormData) {
  "use server"
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const name = formData.get("name") as string

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  })

  revalidatePath("/dashboard/settings")
}

async function changePassword(formData: FormData) {
  "use server"
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (newPassword !== confirmPassword) {
    redirect("/dashboard/settings?error=password_mismatch")
  }

  if (newPassword.length < 8) {
    redirect("/dashboard/settings?error=password_too_short")
  }

  // Get current user with password
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user?.password) {
    redirect("/dashboard/settings?error=no_password")
  }

  // Verify current password
  const { verifyPassword } = await import("@/lib/auth/password")
  const isValid = await verifyPassword(currentPassword, user.password)

  if (!isValid) {
    redirect("/dashboard/settings?error=incorrect_password")
  }

  // Hash and update new password
  const hashedPassword = await hashPassword(newPassword)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  })

  revalidatePath("/dashboard/settings")
}
