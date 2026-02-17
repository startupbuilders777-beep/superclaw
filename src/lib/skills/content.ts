// Content Creator Skills Pack
// Based on SPEC.md - Skills section

export interface Skill {
  id: string
  name: string
  description: string
  icon: string
  category: string
  prompts: {
    system: string
    user?: string
  }
  config?: Record<string, any>
}

export const CONTENT_SKILLS: Skill[] = [
  {
    id: "content-writer",
    name: "Content Writer",
    description: "Write engaging posts, articles, and updates on specified topics",
    icon: "✍️",
    category: "content",
    prompts: {
      system: "You are a professional content writer. Create engaging, well-structured content that resonates with the target audience. Adapt tone and style as needed.",
    },
  },
  {
    id: "content-scheduler",
    name: "Content Scheduler",
    description: "Schedule content for optimal engagement times",
    icon: "📅",
    category: "content",
    prompts: {
      system: "You are a content scheduling expert. Analyze optimal posting times and create scheduling recommendations.",
    },
    config: {
      optimalTimes: ["9:00", "12:00", "17:00", "20:00"],
      timezone: "UTC",
    },
  },
  {
    id: "content-repurpose",
    name: "Content Repurposer",
    description: "Repurpose existing content for different platforms",
    icon: "♻️",
    category: "content",
    prompts: {
      system: "You are a content repurposing specialist. Transform content to suit different platforms while maintaining the core message.",
    },
  },
]

export function getContentSkills(): Skill[] {
  return CONTENT_SKILLS
}

export function getContentSkillById(id: string): Skill | undefined {
  return CONTENT_SKILLS.find((skill) => skill.id === id)
}
