// Customer Support Skills Pack
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

export const SUPPORT_SKILLS: Skill[] = [
  {
    id: "support-auto-reply",
    name: "Auto-Reply",
    description: "Automatically respond to common inquiries",
    icon: "🤖",
    category: "support",
    prompts: {
      system: "You are a customer support agent. Provide helpful, friendly responses to common questions while escalating complex issues.",
    },
    config: {
      responseDelay: 0,
      tone: "professional",
    },
  },
  {
    id: "support-faq",
    name: "FAQ Generator",
    description: "Answer frequently asked questions",
    icon: "❓",
    category: "support",
    prompts: {
      system: "You are an FAQ specialist. Provide clear, concise answers to frequently asked questions based on provided documentation.",
    },
  },
  {
    id: "support-tickets",
    name: "Ticket Router",
    description: "Categorize and route support tickets",
    icon: "🎫",
    category: "support",
    prompts: {
      system: "You are a support ticket routing system. Analyze incoming tickets and categorize them by urgency and department.",
    },
    config: {
      categories: ["billing", "technical", "general", "escalation"],
    },
  },
]

export function getSupportSkills(): Skill[] {
  return SUPPORT_SKILLS
}

export function getSupportSkillById(id: string): Skill | undefined {
  return SUPPORT_SKILLS.find((skill) => skill.id === id)
}
