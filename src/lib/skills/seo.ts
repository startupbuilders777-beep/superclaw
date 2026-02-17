// SEO Specialist Skills Pack
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

export const SEO_SKILLS: Skill[] = [
  {
    id: "seo-keyword-research",
    name: "Keyword Research",
    description: "Find relevant keywords for content optimization",
    icon: "🔑",
    category: "seo",
    prompts: {
      system: "You are an SEO keyword research specialist. Identify high-value keywords with good search volume and manageable competition.",
    },
  },
  {
    id: "seo-onpage",
    name: "On-Page Optimizer",
    description: "Optimize content for search engine rankings",
    icon: "⚙️",
    category: "seo",
    prompts: {
      system: "You are an on-page SEO specialist. Optimize content structure, headings, meta tags, and internal linking for maximum search visibility.",
    },
  },
  {
    id: "seo-backlinks",
    name: "Backlink Tracker",
    description: "Track and analyze backlink opportunities",
    icon: "🔗",
    category: "seo",
    prompts: {
      system: "You are a backlink strategy specialist. Analyze backlink profiles and identify opportunities for building quality links.",
    },
  },
]

export function getSeoSkills(): Skill[] {
  return SEO_SKILLS
}

export function getSeoSkillById(id: string): Skill | undefined {
  return SEO_SKILLS.find((skill) => skill.id === id)
}
