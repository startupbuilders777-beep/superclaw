"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Skill {
  id: string
  name: string
  description: string
  icon: string
  enabled: boolean
}

const AVAILABLE_SKILLS: Omit<Skill, "enabled">[] = [
  {
    id: "content-creator",
    name: "Content Creator",
    description: "Write posts, schedule content, repurpose content",
    icon: "✍️",
  },
  {
    id: "seo-specialist",
    name: "SEO Specialist",
    description: "Keyword research, on-page optimization, backlink tracking",
    icon: "🔍",
  },
  {
    id: "marketing-copy",
    name: "Marketing Copy",
    description: "Ad copy, email sequences, landing pages",
    icon: "📢",
  },
  {
    id: "customer-support",
    name: "Customer Support",
    description: "Auto-reply, FAQ answers, ticket routing",
    icon: "🎧",
  },
  {
    id: "data-analyst",
    name: "Data Analyst",
    description: "Query data, generate reports, visualizations",
    icon: "📊",
  },
  {
    id: "custom",
    name: "Custom",
    description: "User defines prompts, configures behavior",
    icon: "⚙️",
  },
]

interface SortableSkillItemProps {
  skill: Skill
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

function SortableSkillItem({ skill, onToggle, onRemove }: SortableSkillItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skill.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-700 rounded-lg p-4 border border-gray-600 flex items-center gap-4"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-white"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>
      <span className="text-2xl">{skill.icon}</span>
      <div className="flex-1">
        <h4 className="font-medium text-white">{skill.name}</h4>
        <p className="text-sm text-gray-400">{skill.description}</p>
      </div>
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={skill.enabled}
          onChange={() => onToggle(skill.id)}
          className="sr-only"
        />
        <div className={`block w-12 h-6 rounded-full transition-colors ${
          skill.enabled ? "bg-blue-600" : "bg-gray-500"
        }`}></div>
        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
          skill.enabled ? "transform translate-x-6" : ""
        }`}></div>
      </label>
      <button
        onClick={() => onRemove(skill.id)}
        className="text-gray-400 hover:text-red-400 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

interface SkillConfigProps {
  agentId: string
  initialSkills?: string[]
  onSave?: (skills: string[]) => void
}

export function SkillConfig({ agentId, initialSkills = [], onSave }: SkillConfigProps) {
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(() => {
    return AVAILABLE_SKILLS.filter(s => initialSkills.includes(s.id)).map(s => ({
      ...s,
      enabled: true,
    }))
  })

  const [availableSkills] = useState(AVAILABLE_SKILLS)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSelectedSkills((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleToggle = (id: string) => {
    setSelectedSkills((skills) =>
      skills.map((skill) =>
        skill.id === id ? { ...skill, enabled: !skill.enabled } : skill
      )
    )
  }

  const handleRemove = (id: string) => {
    setSelectedSkills((skills) => skills.filter((skill) => skill.id !== id))
  }

  const handleAddSkill = (skillId: string) => {
    const skillToAdd = availableSkills.find((s) => s.id === skillId)
    if (skillToAdd && !selectedSkills.find((s) => s.id === skillId)) {
      setSelectedSkills([...selectedSkills, { ...skillToAdd, enabled: true }])
    }
  }

  const handleSave = async () => {
    const enabledSkills = selectedSkills
      .filter((s) => s.enabled)
      .map((s) => s.id)

    if (onSave) {
      onSave(enabledSkills)
    }

    try {
      const response = await fetch(`/api/agents/${agentId}/skills`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: enabledSkills }),
      })

      if (response.ok) {
        alert("Skills saved successfully!")
      }
    } catch (error) {
      console.error("Failed to save skills:", error)
    }
  }

  const selectedIds = selectedSkills.map((s) => s.id)
  const unselectedSkills = availableSkills.filter((s) => !selectedIds.includes(s.id))

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-6">Skill Configuration</h3>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Active Skills (drag to reorder)</h4>
        
        {selectedSkills.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-600 rounded-lg">
            No skills selected. Add skills from the list below.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedSkills.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {selectedSkills.map((skill) => (
                  <SortableSkillItem
                    key={skill.id}
                    skill={skill}
                    onToggle={handleToggle}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Available Skills</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {unselectedSkills.map((skill) => (
            <button
              key={skill.id}
              onClick={() => handleAddSkill(skill.id)}
              className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 border border-gray-600 flex items-center gap-3 transition-colors text-left"
            >
              <span className="text-xl">{skill.icon}</span>
              <div>
                <p className="font-medium text-white text-sm">{skill.name}</p>
                <p className="text-xs text-gray-400">{skill.description}</p>
              </div>
              <span className="ml-auto text-gray-400">+</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        Save Configuration
      </button>
    </div>
  )
}
