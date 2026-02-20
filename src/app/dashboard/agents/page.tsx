"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AGENT_TEMPLATES, getDefaultSkills, type AgentTemplate } from "@/lib/agent-templates"

interface Agent {
  id: string
  name: string
  description: string
  status: string
  healthStatus: string | null
  skills: Record<string, boolean> | null
  containerStatus: string | null
  createdAt: string
  updatedAt: string
}

export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [newAgentName, setNewAgentName] = useState("")
  const [newAgentDescription, setNewAgentDescription] = useState("")
  const [editAgentName, setEditAgentName] = useState("")
  const [editAgentDescription, setEditAgentDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<Record<string, boolean>>(getDefaultSkills())
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null)
  const [showTemplates, setShowTemplates] = useState(true)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents")
      if (res.ok) {
        const data = await res.json()
        setAgents(data.agents || [])
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTemplate = (template: AgentTemplate) => {
    setSelectedTemplate(template)
    setSelectedSkills(template.skills)
    setNewAgentName(template.name)
    setShowTemplates(false)
  }

  const handleCreateAgent = async () => {
    if (!newAgentName.trim()) return
    
    setCreating(true)
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAgentName,
          description: newAgentDescription,
          skills: selectedSkills,
        }),
      })

      if (res.ok) {
        setShowCreateModal(false)
        setShowTemplates(true)
        setSelectedTemplate(null)
        setNewAgentName("")
        setNewAgentDescription("")
        setSelectedSkills(getDefaultSkills())
        fetchAgents()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to create agent")
      }
    } catch (error) {
      console.error("Failed to create agent:", error)
      alert("Failed to create agent")
    } finally {
      setCreating(false)
    }
  }

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent)
    setEditAgentName(agent.name)
    setEditAgentDescription(agent.description || "")
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingAgent || !editAgentName.trim()) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/agents/${editingAgent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editAgentName,
          description: editAgentDescription,
        }),
      })

      if (res.ok) {
        setShowEditModal(false)
        setEditingAgent(null)
        fetchAgents()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to update agent")
      }
    } catch (error) {
      console.error("Failed to update agent:", error)
      alert("Failed to update agent")
    } finally {
      setSaving(false)
    }
  }

  const handleStartAgent = async (agentId: string) => {
    try {
      const res = await fetch(`/api/agents/${agentId}/spawn`, { method: "POST" })
      if (res.ok) {
        fetchAgents()
      }
    } catch (error) {
      console.error("Failed to start agent:", error)
    }
  }

  const handleStopAgent = async (agentId: string) => {
    try {
      const res = await fetch(`/api/agents/${agentId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "stopped" }),
      })
      if (res.ok) {
        fetchAgents()
      }
    } catch (error) {
      console.error("Failed to stop agent:", error)
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return
    
    try {
      const res = await fetch(`/api/agents/${agentId}`, { method: "DELETE" })
      if (res.ok) {
        fetchAgents()
      }
    } catch (error) {
      console.error("Failed to delete agent:", error)
    }
  }

  const handleConfigureSkills = (agentId: string) => {
    router.push(`/dashboard/skills?agent=${agentId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-900 text-green-300"
      case "stopped": return "bg-gray-700 text-gray-300"
      case "pending": return "bg-yellow-900 text-yellow-300"
      case "error": return "bg-red-900 text-red-300"
      default: return "bg-gray-700 text-gray-300"
    }
  }

  const getHealthColor = (health: string | null) => {
    switch (health) {
      case "healthy": return "text-green-400"
      case "unhealthy": return "text-red-400"
      default: return "text-gray-400"
    }
  }

  const skillLabels: Record<string, string> = {
    messaging: "Messaging",
    discord: "Discord",
    telegram: "Telegram",
    slack: "Slack",
    content: "Content",
    seo: "SEO",
    marketing: "Marketing",
    calendar: "Calendar",
    support: "Support",
    data: "Data",
    auto_reply: "Auto-Reply",
    faq_answers: "FAQ Answers",
    ticket_routing: "Ticket Routing",
    write_posts: "Write Posts",
    schedule_content: "Schedule Content",
    repurpose_content: "Repurpose Content",
    keyword_research: "Keyword Research",
    onpage_optimization: "On-Page Optimization",
    backlink_tracking: "Backlink Tracking",
    ad_copy: "Ad Copy",
    email_sequences: "Email Sequences",
    landing_pages: "Landing Pages",
    query_data: "Query Data",
    generate_reports: "Generate Reports",
    visualizations: "Visualizations",
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
    setShowTemplates(true)
    setSelectedTemplate(null)
    setNewAgentName("")
    setNewAgentDescription("")
    setSelectedSkills(getDefaultSkills())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading agents...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="text-gray-400 hover:text-white">← Back</a>
              <h1 className="text-2xl font-bold text-white">Agent Management</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              + Create Agent
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Agent List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          {agents.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 mb-4">You haven&apos;t created any agents yet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                Create Your First Agent
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-750">
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Health</th>
                    <th className="px-6 py-4 font-medium">Skills</th>
                    <th className="px-6 py-4 font-medium">Created</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {agents.map((agent) => {
                    const skills = agent.skills as Record<string, boolean> | null
                    const activeSkills = skills ? Object.entries(skills).filter(([_, v]) => v).length : 0
                    
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
                          {activeSkills > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(skills || {}).filter(([_, v]) => v).map(([key]) => (
                                <span key={key} className="px-2 py-0.5 bg-gray-700 rounded text-xs">
                                  {skillLabels[key] || key}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">Not configured</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(agent.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleConfigureSkills(agent.id)}
                              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors"
                            >
                              Configure
                            </button>
                            {agent.status === "active" ? (
                              <button
                                onClick={() => handleStopAgent(agent.id)}
                                className="px-3 py-1.5 bg-red-700 hover:bg-red-600 rounded text-white text-sm transition-colors"
                              >
                                Stop
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartAgent(agent.id)}
                                className="px-3 py-1.5 bg-green-700 hover:bg-green-600 rounded text-white text-sm transition-colors"
                              >
                                Start
                              </button>
                            )}
                            <button
                              onClick={() => handleEditAgent(agent)}
                              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 rounded text-white text-sm transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAgent(agent.id)}
                              className="px-3 py-1.5 bg-gray-700 hover:bg-red-600 rounded text-white text-sm transition-colors"
                            >
                              Delete
                            </button>
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
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white mb-4">
              {showTemplates ? "Choose a Template" : "Create New Agent"}
            </h2>
            
            {/* Template Selection */}
            {showTemplates && (
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-4">
                  Start with a pre-built template or create a custom agent from scratch.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {AGENT_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="p-4 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-blue-500 rounded-lg text-left transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{template.icon}</span>
                        <span className="text-white font-medium">{template.name}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{template.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(template.skills).filter(([_, v]) => v).slice(0, 3).map(([key]) => (
                          <span key={key} className="px-2 py-0.5 bg-gray-600 rounded text-xs text-gray-300">
                            {skillLabels[key] || key}
                          </span>
                        ))}
                        {Object.entries(template.skills).filter(([_, v]) => v).length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-600 rounded text-xs text-gray-300">
                            +{Object.entries(template.skills).filter(([_, v]) => v).length - 3} more
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setShowTemplates(false)
                    setSelectedTemplate(null)
                    setNewAgentName("")
                    setSelectedSkills(getDefaultSkills())
                  }}
                  className="mt-4 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white font-medium transition-colors"
                >
                  Start from Scratch
                </button>
              </div>
            )}

            {/* Agent Form (after template selected or scratch) */}
            {!showTemplates && (
              <>
                {selectedTemplate && (
                  <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{selectedTemplate.icon}</span>
                      <span className="text-blue-300 font-medium">Using template: {selectedTemplate.name}</span>
                      <button
                        onClick={() => {
                          setShowTemplates(true)
                          setSelectedTemplate(null)
                        }}
                        className="ml-auto text-sm text-gray-400 hover:text-white"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">Agent Name</label>
                  <input
                    type="text"
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    placeholder="My AI Agent"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">Description (optional)</label>
                  <textarea
                    value={newAgentDescription}
                    onChange={(e) => setNewAgentDescription(e.target.value)}
                    rows={2}
                    placeholder="What is this agent for?"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-400 text-sm mb-2">Initial Skills</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-900/50 rounded-lg">
                    {Object.entries(selectedSkills).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-2 text-gray-300">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setSelectedSkills({ ...selectedSkills, [key]: e.target.checked })}
                          className="rounded bg-gray-700 border-gray-600"
                        />
                        {skillLabels[key] || key}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCloseCreateModal}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAgent}
                    disabled={creating || !newAgentName.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? "Creating..." : "Create Agent"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Edit Agent</h2>
            
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Agent Name</label>
              <input
                type="text"
                value={editAgentName}
                onChange={(e) => setEditAgentName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">Description</label>
              <textarea
                value={editAgentDescription}
                onChange={(e) => setEditAgentDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="What is this agent for?"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editAgentName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
