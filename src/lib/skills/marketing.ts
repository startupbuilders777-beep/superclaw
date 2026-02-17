// Marketing Copy Skills Pack
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

export const MARKETING_SKILLS: Skill[] = [
  {
    id: "marketing-ad-copy",
    name: "Ad Copywriter",
    description: "Write compelling advertising copy",
    icon: "📢",
    category: "marketing",
    prompts: {
      system: "You are a professional advertising copywriter. Create compelling, persuasive copy that drives conversions across digital ad platforms.",
    },
  },
  {
    id: "marketing-email",
    name: "Email Sequences",
    description: "Write email sequences and newsletters",
    icon: "📧",
    category: "marketing",
    prompts: {
      system: "You are an email marketing specialist. Create engaging email sequences that nurture leads and drive conversions.",
    },
  },
  {
    id: "marketing-landing",
    name: "Landing Page Copy",
    description: "Write high-converting landing page content",
    icon: "🛬",
    category: "marketing",
    prompts: {
      system: "You are a landing page copywriter. Create persuasive, conversion-focused copy that maximizes landing page performance.",
    },
  },
]

export function getMarketingSkills(): Skill[] {
  return MARKETING_SKILLS
}

export function getMarketingSkillById(id: string): Skill | undefined {
  return MARKETING_SKILLS.find((skill) => skill.id === id)
}
