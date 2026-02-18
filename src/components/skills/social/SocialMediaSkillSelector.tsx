"use client"

import { useState } from "react"
import { SOCIAL_MEDIA_SKILLS, SocialMediaSkill } from "@/lib/skills/socialMedia"

interface SocialMediaSkillSelectorProps {
  agentId: string
  initialSkills?: string[]
}

export function SocialMediaSkillSelector({
  agentId,
  initialSkills = [],
}: SocialMediaSkillSelectorProps) {
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(
    new Set(initialSkills)
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggleSkill = (skillId: string) => {
    const newSelected = new Set(selectedSkills)
    if (newSelected.has(skillId)) {
      newSelected.delete(skillId)
    } else {
      newSelected.add(skillId)
    }
    setSelectedSkills(newSelected)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    try {
      const response = await fetch(`/api/agents/${agentId}/skills`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: Array.from(selectedSkills),
          skillType: "social-media",
        }),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error("Failed to save skills:", error)
    } finally {
      setSaving(false)
    }
  }

  const categories = [
    { key: "content", label: "Content", icon: "✍️" },
    { key: "engagement", label: "Engagement", icon: "💬" },
    { key: "analytics", label: "Analytics", icon: "📊" },
    { key: "automation", label: "Automation", icon: "⚡" },
  ] as const

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Social Media Skills</h3>
        <p className="text-gray-400 text-sm mt-1">
          Select the skills you want your agent to have for social media management
        </p>
      </div>

      {categories.map(({ key, label, icon }) => {
        const categorySkills = SOCIAL_MEDIA_SKILLS.filter(
          (s) => s.category === key
        )
        if (categorySkills.length === 0) return null

        return (
          <div key={key} className="mb-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <span>{icon}</span> {label}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categorySkills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => toggleSkill(skill.id)}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    selectedSkills.has(skill.id)
                      ? "bg-blue-600/20 border-blue-500"
                      : "bg-gray-700/50 border-gray-600 hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{skill.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-white">{skill.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {skill.description}
                      </p>
                    </div>
                    {selectedSkills.has(skill.id) && (
                      <span className="text-blue-400">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {/* Summary */}
      <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
        <p className="text-sm text-gray-300">
          <span className="font-medium text-white">
            {selectedSkills.size}
          </span>{" "}
          skill{selectedSkills.size !== 1 ? "s" : ""} selected
        </p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
      >
        {saving ? "Saving..." : "Save Skills"}
      </button>

      {saved && (
        <p className="text-green-400 text-sm text-center mt-3">
          Skills saved successfully!
        </p>
      )}
    </div>
  )
}
