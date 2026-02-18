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
  templates?: SkillTemplate[]
}

export interface SkillTemplate {
  id: string
  name: string
  description: string
  systemPrompt: string
  userPromptTemplate?: string
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
    templates: [
      {
        id: "blog-post",
        name: "Blog Post",
        description: "Write a full blog article with intro, body, and conclusion",
        systemPrompt: "You are a professional blog writer. Create in-depth, well-researched blog posts with compelling headlines, clear structure using H2/H3 headings, and actionable conclusions. Optimize for readability and SEO.",
      },
      {
        id: "social-post",
        name: "Social Media Post",
        description: "Create engaging social media content for Twitter, LinkedIn, etc.",
        systemPrompt: "You are a social media content creator. Write concise, engaging posts tailored to each platform. Use hooks, include relevant hashtags, and end with clear CTAs.",
        userPromptTemplate: "Create a {{platform}} post about {{topic}}. Target audience: {{audience}}. Tone: {{tone}}.",
      },
      {
        id: "email-newsletter",
        name: "Email Newsletter",
        description: "Write newsletters that engage and convert readers",
        systemPrompt: "You are an email newsletter writer. Create compelling newsletters with strong subject lines, personalized greeting, valuable content sections, and clear CTAs.",
        userPromptTemplate: "Write a newsletter for {{industry}} business. Include: {{sections}}. Length: {{length}}.",
      },
      {
        id: "product-description",
        name: "Product Description",
        description: "Write compelling product descriptions that drive sales",
        systemPrompt: "You are a product copywriter. Write descriptions that highlight benefits, use sensory language, and create urgency. Focus on value proposition and differentiation.",
        userPromptTemplate: "Write a product description for {{productName}}. Key features: {{features}}. Target: {{audience}}.",
      },
    ],
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
    templates: [
      {
        id: "calendar-plan",
        name: "Content Calendar",
        description: "Create a monthly content calendar with topics and dates",
        systemPrompt: "You are a content calendar specialist. Plan content schedules considering industry trends, peak engagement times, and content variety.",
        userPromptTemplate: "Create a {{month}} content calendar for {{businessType}}. Include {{postsPerWeek}} posts per week.",
      },
      {
        id: "optimal-timing",
        name: "Optimal Timing Analysis",
        description: "Find the best times to post based on audience behavior",
        systemPrompt: "You are an engagement timing analyst. Analyze audience behavior patterns to determine optimal posting schedules across platforms.",
      },
      {
        id: "campaign-schedule",
        name: "Campaign Schedule",
        description: "Plan a multi-platform campaign rollout",
        systemPrompt: "You are a campaign manager. Create detailed schedules for multi-platform marketing campaigns with cross-promotion strategies.",
        userPromptTemplate: "Schedule a {{campaignName}} campaign running for {{duration}}. Platforms: {{platforms}}.",
      },
    ],
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
    templates: [
      {
        id: "blog-to-social",
        name: "Blog to Social",
        description: "Convert blog posts into social media snippets",
        systemPrompt: "You excel at extracting key insights from long-form content and crafting platform-specific social posts.",
        userPromptTemplate: "Turn this blog post into {{number}} social posts for {{platform}}: {{content}}",
      },
      {
        id: "video-to-blog",
        name: "Video to Blog",
        description: "Convert video content into written articles",
        systemPrompt: "You transform video scripts and transcripts into engaging blog posts with proper structure and SEO.",
      },
      {
        id: "thread-creator",
        name: "Twitter Thread",
        description: "Create threaded tweets from long-form content",
        systemPrompt: "You specialize in creating compelling Twitter threads that tell a story and drive engagement.",
        userPromptTemplate: "Create a Twitter thread from this content: {{content}}. Add hook, main points, and CTA.",
      },
      {
        id: "podcast-notes",
        name: "Podcast Show Notes",
        description: "Generate show notes and timestamps from podcast episodes",
        systemPrompt: "You create comprehensive show notes with timestamps, key takeaways, and links mentioned in podcasts.",
      },
    ],
  },
]

export function getContentSkills(): Skill[] {
  return CONTENT_SKILLS
}

export function getContentSkillById(id: string): Skill | undefined {
  return CONTENT_SKILLS.find((skill) => skill.id === id)
}
