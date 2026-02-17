"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Step = "welcome" | "agent-setup" | "skill-picker" | "api-key" | "tutorial" | "complete"

interface OnboardingData {
  agentName: string
  apiKey: string
  agentId: string
  selectedSkills: string[]
}

const AVAILABLE_SKILLS = [
  { id: "messaging", name: "Messaging", icon: "💬", description: "Send messages via Telegram, Discord, Slack" },
  { id: "calendar", name: "Calendar", icon: "📅", description: "Schedule meetings and manage events" },
  { id: "content", name: "Content Writing", icon: "📝", description: "Write blog posts, emails, social media" },
  { id: "seo", name: "SEO", icon: "🔍", description: "Optimize content for search engines" },
  { id: "marketing", name: "Marketing", icon: "📢", description: "Run ad campaigns and analyze metrics" },
  { id: "support", name: "Customer Support", icon: "🎧", description: "Handle support tickets and FAQs" },
  { id: "data", name: "Data Analysis", icon: "📊", description: "Analyze data and generate reports" },
  { id: "custom", name: "Custom", icon: "⚙️", description: "Build custom skills with code" }
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("welcome")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    agentName: "",
    apiKey: "",
    agentId: "",
    selectedSkills: []
  })
  const [error, setError] = useState("")

  const steps: { key: Step; label: string }[] = [
    { key: "welcome", label: "Welcome" },
    { key: "agent-setup", label: "Create Agent" },
    { key: "skill-picker", label: "Skills" },
    { key: "api-key", label: "API Key" },
    { key: "tutorial", label: "Tutorial" }
  ]

  const currentStepIndex = steps.findIndex(s => s.key === currentStep)

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key)
    } else {
      setCurrentStep("complete")
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  const toggleSkill = (skillId: string) => {
    setData(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skillId)
        ? prev.selectedSkills.filter(s => s !== skillId)
        : [...prev.selectedSkills, skillId]
    }))
  }

  const handleCreateAgent = async () => {
    if (!data.agentName.trim()) {
      setError("Please enter an agent name")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "create-agent",
          data: { 
            name: data.agentName,
            skills: data.selectedSkills
          }
        })
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Failed to create agent")
      }

      setData(prev => ({
        ...prev,
        agentId: result.agent.id,
        apiKey: result.apiKey
      }))

      handleNext()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "complete-onboarding" })
      })
      router.push("/dashboard")
    } catch (err) {
      setError("Failed to complete onboarding")
    } finally {
      setLoading(false)
    }
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText(data.apiKey)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Progress Steps */}
        {currentStep !== "welcome" && currentStep !== "complete" && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index <= currentStepIndex
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 sm:w-24 h-0.5 mx-2 ${
                        index < currentStepIndex ? "bg-blue-600" : "bg-gray-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              {steps.map(step => (
                <span key={step.key} className={currentStep === step.key ? "text-blue-400" : ""}>
                  {step.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
          {/* Welcome Step */}
          {currentStep === "welcome" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Welcome to SuperClaw! 🚀</h1>
              <p className="text-gray-400 mb-8">
                Your personal AI agent platform is ready. Let&apos;s get you set up in just a few steps.
              </p>
              <div className="space-y-3 text-left bg-gray-900 rounded-lg p-4 mb-8">
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs">1</span>
                  Create your first AI agent
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs">2</span>
                  Choose skills for your agent
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs">3</span>
                  Get your API key
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs">4</span>
                  Quick tutorial
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleNext}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Get Started
                </button>
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Agent Setup Step */}
          {currentStep === "agent-setup" && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Create Your First Agent</h2>
              <p className="text-gray-400 mb-6">Give your AI agent a name to get started.</p>
              
              <div className="mb-6">
                <label htmlFor="agentName" className="block text-sm font-medium text-gray-300 mb-2">
                  Agent Name
                </label>
                <input
                  type="text"
                  id="agentName"
                  value={data.agentName}
                  onChange={(e) => setData(prev => ({ ...prev, agentName: e.target.value }))}
                  placeholder="My Personal Assistant"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleNext}
                  disabled={!data.agentName.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Continue
                </button>
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Skill Picker Step */}
          {currentStep === "skill-picker" && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Choose Agent Skills</h2>
              <p className="text-gray-400 mb-6">Select the skills you want your agent to have.</p>

              <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                {AVAILABLE_SKILLS.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      data.selectedSkills.includes(skill.id)
                        ? "bg-blue-600/20 border-blue-500"
                        : "bg-gray-900 border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{skill.icon}</span>
                      <div>
                        <div className="font-medium text-white">{skill.name}</div>
                        <div className="text-sm text-gray-400">{skill.description}</div>
                      </div>
                      {data.selectedSkills.includes(skill.id) && (
                        <svg className="w-5 h-5 text-blue-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {data.selectedSkills.length > 0 && (
                <div className="mb-4 p-3 bg-gray-900 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Selected: {data.selectedSkills.length} skill(s)</div>
                  <div className="flex flex-wrap gap-2">
                    {data.selectedSkills.map(id => {
                      const skill = AVAILABLE_SKILLS.find(s => s.id === id)
                      return (
                        <span key={id} className="px-2 py-1 bg-blue-600/30 text-blue-300 text-xs rounded-full">
                          {skill?.icon} {skill?.name}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleCreateAgent}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  {loading ? "Creating..." : "Create Agent"}
                </button>
              </div>
            </div>
          )}

          {/* API Key Step */}
          {currentStep === "api-key" && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Your API Key</h2>
              <p className="text-gray-400 mb-6">
                Save this API key somewhere safe. You&apos;ll need it to connect your agent to external services.
              </p>

              <div className="mb-6">
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <code className="text-green-400 font-mono text-sm break-all">{data.apiKey}</code>
                    <button
                      onClick={copyApiKey}
                      className="ml-4 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-yellow-200 text-sm">
                    This is the only time you&apos;ll see this key. Store it securely!
                  </p>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                I&apos;ve Saved My Key
              </button>
            </div>
          )}

          {/* Tutorial Step */}
          {currentStep === "tutorial" && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">How to Use Your Agent</h2>
              <p className="text-gray-400 mb-6">Here&apos;s what you can do with SuperClaw:</p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 bg-gray-900 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Messaging</h3>
                    <p className="text-gray-400 text-sm">Your agent can send messages via Telegram, Discord, and more.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-900 rounded-lg">
                  <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Scheduling</h3>
                    <p className="text-gray-400 text-sm">Connect calendar integrations to manage appointments.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-900 rounded-lg">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Skills</h3>
                    <p className="text-gray-400 text-sm">Add more skills like Slack, email, and custom integrations.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleComplete}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? "Completing..." : "Go to Dashboard"}
              </button>
            </div>
          )}

          {/* Complete Step */}
          {currentStep === "complete" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">You&apos;re All Set! 🎉</h1>
              <p className="text-gray-400 mb-8">
                Your agent is ready. You can always modify settings and add more agents from the dashboard.
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Skip link */}
        {currentStep !== "welcome" && currentStep !== "complete" && currentStep !== "skill-picker" && (
          <p className="text-center mt-6 text-gray-500 text-sm">
            Want to skip for now?{" "}
            <button onClick={handleSkip} className="text-blue-400 hover:text-blue-300">
              Go to Dashboard
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
