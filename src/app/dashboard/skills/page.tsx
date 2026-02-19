import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

const AVAILABLE_SKILLS = [
  {
    category: "Content Creator",
    skills: [
      { id: "write_posts", name: "Write Posts", description: "Generate engaging social media posts" },
      { id: "schedule_content", name: "Schedule Content", description: "Plan and schedule content calendar" },
      { id: "repurpose_content", name: "Repurpose Content", description: "Adapt content for different platforms" },
    ],
  },
  {
    category: "SEO Specialist",
    skills: [
      { id: "keyword_research", name: "Keyword Research", description: "Find optimal keywords for your niche" },
      { id: "onpage_optimization", name: "On-Page Optimization", description: "Optimize content for search engines" },
      { id: "backlink_tracking", name: "Backlink Tracking", description: "Monitor and analyze backlinks" },
    ],
  },
  {
    category: "Marketing Copy",
    skills: [
      { id: "ad_copy", name: "Ad Copy", description: "Write compelling advertising copy" },
      { id: "email_sequences", name: "Email Sequences", description: "Create automated email sequences" },
      { id: "landing_pages", name: "Landing Pages", description: "Write high-converting landing page copy" },
    ],
  },
  {
    category: "Customer Support",
    skills: [
      { id: "auto_reply", name: "Auto-Reply", description: "Automatic responses to common queries" },
      { id: "faq_answers", name: "FAQ Answers", description: "Generate answers to frequently asked questions" },
      { id: "ticket_routing", name: "Ticket Routing", description: "Intelligently route support tickets" },
    ],
  },
  {
    category: "Data Analyst",
    skills: [
      { id: "query_data", name: "Query Data", description: "Answer questions about your data" },
      { id: "generate_reports", name: "Generate Reports", description: "Create insightful data reports" },
      { id: "visualizations", name: "Visualizations", description: "Generate data visualizations" },
    ],
  },
]

export default async function SkillsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Get user with agents and skills
  const { prisma } = await import("@/lib/prisma")
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { agents: true },
  })

  if (!user) {
    redirect("/login")
  }

  // Get the first agent for skills configuration (simplified for now)
  const agent = user.agents[0]
  const currentSkills = (agent?.skills as Record<string, unknown> | null) || {}

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
              <Link href="/dashboard" className="text-gray-300 hover:text-white">
                Dashboard
              </Link>
              <span className="text-gray-500">/</span>
              <span className="text-gray-300">Skills</span>
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Configure Skills</h1>
          <p className="mt-2 text-gray-400">Choose what your AI agent can do</p>
        </div>

        {user.agents.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
            <p className="text-gray-400 mb-4">You need to create an agent first before configuring skills.</p>
            <Link href="/dashboard" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Agent Selector */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">Select Agent</h2>
              <div className="flex gap-3 flex-wrap">
                {user.agents.map((a: { id: string; name: string }) => (
                  <button
                    key={a.id}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills by Category */}
            {AVAILABLE_SKILLS.map((category) => (
              <div key={category.category} className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold text-white">{category.category}</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.skills.map((skill) => {
                    const isEnabled = currentSkills[skill.id]
                    return (
                      <div
                        key={skill.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          Boolean(isEnabled)
                            ? "bg-blue-900/30 border-blue-600"
                            : "bg-gray-750 border-gray-700 hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-white font-medium">{skill.name}</h3>
                            <p className="text-gray-400 text-sm mt-1">{skill.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            Boolean(isEnabled) ? "bg-blue-600 border-blue-600" : "border-gray-500"
                          }`}>
                            {Boolean(isEnabled) && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Link href="/dashboard" className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors">
                Cancel
              </Link>
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
                Save Skills Configuration
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
