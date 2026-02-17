// Skill Configuration System
// Unified export for all skill templates

import { CONTENT_SKILLS, getContentSkills, getContentSkillById } from './content'
import { SEO_SKILLS, getSeoSkills, getSeoSkillById } from './seo'
import { MARKETING_SKILLS, getMarketingSkills, getMarketingSkillById } from './marketing'
import { SUPPORT_SKILLS, getSupportSkills, getSupportSkillById } from './support'
import { DATA_SKILLS, getDataSkills, getDataSkillById } from './data'
import { SOCIAL_MEDIA_SKILLS, getSkillsByCategory, getSkillById as getSocialMediaSkillById, getSocialMediaSkillsConfig } from './socialMedia'

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

export interface SkillCategory {
  id: string
  name: string
  icon: string
  description: string
  skills: Skill[]
}

// Skill Categories
export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "content",
    name: "Content Creator",
    icon: "✍️",
    description: "Write, schedule, and repurpose content",
    skills: CONTENT_SKILLS,
  },
  {
    id: "seo",
    name: "SEO Specialist",
    icon: "🔍",
    description: "Keyword research, optimization, backlinks",
    skills: SEO_SKILLS,
  },
  {
    id: "marketing",
    name: "Marketing Copy",
    icon: "📢",
    description: "Ad copy, emails, landing pages",
    skills: MARKETING_SKILLS,
  },
  {
    id: "support",
    name: "Customer Support",
    icon: "💁",
    description: "Auto-reply, FAQs, ticket routing",
    skills: SUPPORT_SKILLS,
  },
  {
    id: "data",
    name: "Data Analyst",
    icon: "📊",
    description: "Query data, generate reports, visualize",
    skills: DATA_SKILLS,
  },
  {
    id: "social",
    name: "Social Media",
    icon: "🌐",
    description: "Content, engagement, analytics",
    skills: SOCIAL_MEDIA_SKILLS,
  },
]

// Get all skills flat
export function getAllSkills(): Skill[] {
  return [
    ...CONTENT_SKILLS,
    ...SEO_SKILLS,
    ...MARKETING_SKILLS,
    ...SUPPORT_SKILLS,
    ...DATA_SKILLS,
    ...SOCIAL_MEDIA_SKILLS,
  ]
}

// Get skill by ID from any category
export function getSkillById(id: string): Skill | undefined {
  return getAllSkills().find((skill) => skill.id === id)
}

// Get category by ID
export function getCategoryById(id: string): SkillCategory | undefined {
  return SKILL_CATEGORIES.find((cat) => cat.id === id)
}

// Get skills by category ID
export function getSkillsForCategory(categoryId: string): Skill[] {
  const category = getCategoryById(categoryId)
  return category?.skills || []
}

export { 
  CONTENT_SKILLS, 
  SEO_SKILLS, 
  MARKETING_SKILLS, 
  SUPPORT_SKILLS, 
  DATA_SKILLS,
  SOCIAL_MEDIA_SKILLS,
  getContentSkills,
  getSeoSkills,
  getMarketingSkills,
  getSupportSkills,
  getDataSkills,
  getSkillsByCategory,
  getContentSkillById,
  getSeoSkillById,
  getMarketingSkillById,
  getSupportSkillById,
  getDataSkillById,
  getSocialMediaSkillById,
  getSocialMediaSkillsConfig,
}
