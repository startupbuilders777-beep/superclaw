/**
 * Pre-built Agent Templates
 * 
 * These templates provide starting points for common use cases.
 * Each template includes a name, description, and pre-configured skills.
 */

export interface AgentTemplate {
  id: string
  name: string
  description: string
  icon: string
  skills: Record<string, boolean>
  recommendedFor: string[]
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "customer-support",
    name: "Customer Support Agent",
    description: "Handle customer inquiries, FAQs, and support tickets automatically",
    icon: "💬",
    skills: {
      messaging: true,
      discord: true,
      telegram: true,
      auto_reply: true,
      faq_answers: true,
      ticket_routing: true,
    },
    recommendedFor: ["SaaS companies", "E-commerce", "Service businesses"],
  },
  {
    id: "content-writer",
    name: "Content Writer Agent",
    description: "Create blog posts, social media content, and marketing copy",
    icon: "✍️",
    skills: {
      messaging: true,
      discord: true,
      telegram: true,
      write_posts: true,
      schedule_content: true,
      repurpose_content: true,
      ad_copy: true,
      email_sequences: true,
    },
    recommendedFor: ["Content creators", "Marketing agencies", "Bloggers"],
  },
  {
    id: "seo-specialist",
    name: "SEO Specialist Agent",
    description: "Optimize your content for search engines and grow organic traffic",
    icon: "🔍",
    skills: {
      messaging: true,
      discord: true,
      telegram: true,
      keyword_research: true,
      onpage_optimization: true,
      backlink_tracking: true,
    },
    recommendedFor: ["SEO professionals", "Marketing teams", "Website owners"],
  },
  {
    id: "data-analyst",
    name: "Data Analyst Agent",
    description: "Query data, generate reports, and create visualizations",
    icon: "📊",
    skills: {
      messaging: true,
      discord: true,
      telegram: true,
      query_data: true,
      generate_reports: true,
      visualizations: true,
    },
    recommendedFor: ["Data teams", "Business analysts", "Startup founders"],
  },
  {
    id: "marketing-assistant",
    name: "Marketing Assistant Agent",
    description: "Handle ad copy, email campaigns, and landing pages",
    icon: "📣",
    skills: {
      messaging: true,
      discord: true,
      telegram: true,
      ad_copy: true,
      email_sequences: true,
      landing_pages: true,
      write_posts: true,
    },
    recommendedFor: ["Marketers", "Small business owners", "Growth hackers"],
  },
]

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): AgentTemplate | undefined {
  return AGENT_TEMPLATES.find((template) => template.id === id)
}

/**
 * Get default skills for new agent (no template)
 */
export function getDefaultSkills(): Record<string, boolean> {
  return {
    messaging: true,
    discord: false,
    telegram: false,
    slack: false,
    content: false,
    seo: false,
    marketing: false,
  }
}
