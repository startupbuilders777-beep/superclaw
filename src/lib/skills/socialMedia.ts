// Social Media Skills Pack
// Based on SPEC.md - Social Media Skills section

export interface SocialMediaSkill {
  id: string
  name: string
  description: string
  icon: string
  category: "content" | "engagement" | "analytics" | "automation"
  prompts: {
    system: string
    user?: string
  }
  config?: Record<string, any>
}

export const SOCIAL_MEDIA_SKILLS: SocialMediaSkill[] = [
  {
    id: "social-content-writer",
    name: "Content Writer",
    description: "Create engaging posts, threads, and updates for social media",
    icon: "✍️",
    category: "content",
    prompts: {
      system: "You are a social media content writer. Create engaging, platform-appropriate content that resonates with the target audience. Adapt tone and style for each platform.",
    },
  },
  {
    id: "social-seo-optimizer",
    name: "SEO Optimizer",
    description: "Optimize content for discoverability and search rankings",
    icon: "🔍",
    category: "content",
    prompts: {
      system: "You are a social media SEO specialist. Optimize content for discoverability using relevant keywords, hashtags, and trending topics.",
    },
  },
  {
    id: "hashtag-research",
    name: "Hashtag Research",
    description: "Find and recommend relevant trending hashtags",
    icon: "#️⃣",
    category: "analytics",
    prompts: {
      system: "You are a hashtag research specialist. Analyze trending hashtags and recommend the most relevant ones for maximum reach.",
    },
  },
  {
    id: "trend-spotter",
    name: "Trend Spotter",
    description: "Identify and leverage trending topics and memes",
    icon: "🔥",
    category: "analytics",
    prompts: {
      system: "You are a trend analyst. Identify emerging trends, viral content patterns, and opportunities for engagement.",
    },
  },
  {
    id: "engagement-auto-reply",
    name: "Engagement Auto-reply",
    description: "Automatically respond to comments and messages",
    icon: "💬",
    category: "engagement",
    prompts: {
      system: "You are a community manager. Respond to comments and messages in a friendly, engaging manner that encourages further interaction.",
    },
    config: {
      responseDelay: 0,
      tone: "friendly",
    },
  },
  {
    id: "social-scheduler",
    name: "Scheduler",
    description: "Schedule posts for optimal engagement times",
    icon: "📅",
    category: "automation",
    prompts: {
      system: "You are a social media scheduler. Determine optimal posting times based on audience engagement patterns.",
    },
    config: {
      optimalTimes: ["9:00", "12:00", "17:00", "20:00"],
      timezone: "UTC",
    },
  },
]

// Get skills by category
export function getSkillsByCategory(category: SocialMediaSkill["category"]) {
  return SOCIAL_MEDIA_SKILLS.filter((skill) => skill.category === category)
}

// Get skill by ID
export function getSkillById(id: string) {
  return SOCIAL_MEDIA_SKILLS.find((skill) => skill.id === id)
}

// Export skills as config object
export function getSocialMediaSkillsConfig() {
  return SOCIAL_MEDIA_SKILLS.map(({ prompts, ...skill }) => skill)
}
