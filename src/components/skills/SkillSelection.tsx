"use client"

import { useState } from "react"
import { SKILL_CATEGORIES, Skill, SkillCategory } from "@/lib/skills"

interface SkillSelectionProps {
  agentId: string
  onComplete?: () => void
}

export function SkillSelection({ agentId, onComplete }: SkillSelectionProps) {
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

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
    if (selectedSkills.size === 0) {
      setError("Please select at least one skill")
      return
    }

    setSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/agents/${agentId}/skills`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: Array.from(selectedSkills),
        }),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => {
          if (onComplete) onComplete()
        }, 1000)
      } else {
        const result = await response.json()
        setError(result.error || "Failed to save skills")
      }
    } catch (err) {
      setError("Failed to save skills")
    } finally {
      setSaving(false)
    }
  }

  const currentCategory: SkillCategory | undefined = selectedCategory
    ? SKILL_CATEGORIES.find((c) => c.id === selectedCategory)
    : undefined

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      {!selectedCategory ? (
        // Category Selection View
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Choose Your Agent&apos;s Skills</h2>
            <p className="text-gray-400">
              Select a category to see available skills. You can pick multiple skills.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SKILL_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="p-4 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-lg text-left transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{category.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white">{category.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{category.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {category.skills.length} skill{category.skills.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        // Skills Selection View
        <>
          <div className="mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-blue-400 hover:text-blue-300 text-sm mb-2 flex items-center gap-1"
            >
              ← Back to categories
            </button>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">{currentCategory?.icon}</span>
              {currentCategory?.name} Skills
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Select the skills you want your agent to have
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {currentCategory?.skills.map((skill: Skill) => (
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
                    <p className="text-xs text-gray-400 mt-1">{skill.description}</p>
                  </div>
                  {selectedSkills.has(skill.id) && (
                    <span className="text-blue-400 text-lg">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="mb-4 p-4 bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-300">
              <span className="font-medium text-white">{selectedSkills.size}</span> skill
              {selectedSkills.size !== 1 ? "s" : ""} selected
              {selectedSkills.size > 0 && (
                <span className="text-gray-400">
                  {" "}
                  (
                  {Array.from(selectedSkills)
                    .map((id) => currentCategory?.skills.find((s) => s.id === id)?.name)
                    .join(", ")}
                  )
                </span>
              )}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || selectedSkills.size === 0}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {saving ? "Saving..." : selectedSkills.size === 0 ? "Select at least one skill" : "Save Skills"}
          </button>

          {saved && (
            <p className="text-green-400 text-sm text-center mt-3">
              Skills saved successfully!
            </p>
          )}
        </>
      )}
    </div>
  )
}
