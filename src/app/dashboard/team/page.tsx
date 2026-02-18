"use client"

import { useState, useEffect } from "react"

interface TeamMember {
  id: string
  email: string
  name: string | null
  role: "ADMIN" | "EDITOR" | "VIEWER"
  status: string
  invitedAt: string
  acceptedAt: string | null
}

interface TeamStats {
  totalMembers: number
  activeMembers: number
  pendingInvites: number
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [stats, setStats] = useState<TeamStats>({ totalMembers: 0, activeMembers: 0, pendingInvites: 0 })
  const [tier, setTier] = useState<string>("FREE")
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "EDITOR" | "VIEWER">("VIEWER")
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/team")
      const data = await res.json()
      if (res.ok) {
        setMembers(data.members || [])
        setTier(data.tier || "FREE")
        const active = (data.members || []).filter((m: TeamMember) => m.status === "active").length
        const pending = (data.members || []).filter((m: TeamMember) => m.status === "pending").length
        setStats({
          totalMembers: (data.members || []).length,
          activeMembers: active,
          pendingInvites: pending,
        })
      }
    } catch (err) {
      console.error("Error fetching team:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeam()
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setInviting(true)

    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteName || undefined,
          role: inviteRole,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to invite")
      } else {
        setSuccess(`Invitation sent to ${inviteEmail}`)
        setInviteEmail("")
        setInviteName("")
        fetchTeam()
      }
    } catch (err) {
      setError("Failed to send invitation")
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return

    try {
      const res = await fetch(`/api/team?id=${memberId}`, { method: "DELETE" })
      if (res.ok) {
        fetchTeam()
      }
    } catch (err) {
      console.error("Error removing member:", err)
    }
  }

  const handleRoleChange = async (memberId: string, role: string) => {
    try {
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role }),
      })
      if (res.ok) {
        fetchTeam()
      }
    } catch (err) {
      console.error("Error updating role:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const isAgency = tier === "AGENCY"

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Team Dashboard</h1>

        {/* Tier Warning */}
        {!isAgency && (
          <div className="mb-8 p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg">
            <h3 className="font-bold text-yellow-400 mb-2">⚠️ Upgrade to Agency Tier</h3>
            <p className="text-yellow-200">
              Team features are available on the Agency tier ($99/mo). 
              <a href="/pricing" className="underline ml-2">View pricing →</a>
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-400">{stats.totalMembers}</div>
            <div className="text-gray-400">Total Members</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-400">{stats.activeMembers}</div>
            <div className="text-gray-400">Active Members</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-yellow-400">{stats.pendingInvites}</div>
            <div className="text-gray-400">Pending Invites</div>
          </div>
        </div>

        {/* Invite Form */}
        {isAgency && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Invite Team Member</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-300">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded text-green-300">
                {success}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                    placeholder="colleague@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Name (optional)</label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                  >
                    <option value="VIEWER">Viewer</option>
                    <option value="EDITOR">Editor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={inviting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium"
              >
                {inviting ? "Sending..." : "Send Invitation"}
              </button>
            </form>
          </div>
        )}

        {/* Team Members List */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Team Members</h2>
          
          {members.length === 0 ? (
            <p className="text-gray-400">No team members yet. Invite someone to get started!</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center font-bold">
                      {(member.name || member.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">
                        {member.name || member.email}
                      </div>
                      <div className="text-sm text-gray-400">{member.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="px-3 py-1 bg-gray-600 border border-gray-500 rounded text-sm"
                      disabled={!isAgency}
                    >
                      <option value="VIEWER">Viewer</option>
                      <option value="EDITOR">Editor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        member.status === "active"
                          ? "bg-green-900 text-green-300"
                          : "bg-yellow-900 text-yellow-300"
                      }`}
                    >
                      {member.status}
                    </span>
                    
                    {isAgency && (
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usage Stats Placeholder */}
        {isAgency && members.length > 0 && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Team Usage This Month</h2>
            <div className="text-gray-400">
              Usage breakdown by team member will appear here once data is available.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
