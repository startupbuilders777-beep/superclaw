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
  templates?: SkillTemplate[]
}

export interface SkillTemplate {
  id: string
  name: string
  description: string
  systemPrompt: string
  userPromptTemplate?: string
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
    templates: [
      {
        id: "seed-keywords",
        name: "Seed Keyword Expansion",
        description: "Generate keyword ideas from seed terms",
        systemPrompt: "You specialize in expanding seed keywords into comprehensive keyword lists with search intent analysis.",
        userPromptTemplate: "Generate keyword ideas for: {{seedKeywords}}. Include long-tail variations.",
      },
      {
        id: "competitor-keywords",
        name: "Competitor Analysis",
        description: "Identify keywords competitors rank for",
        systemPrompt: "You analyze competitor websites to identify keyword opportunities and gaps in their SEO strategy.",
        userPromptTemplate: "Analyze keywords for competitor: {{competitorUrl}}. Find ranking opportunities.",
      },
      {
        id: "local-keywords",
        name: "Local SEO Keywords",
        description: "Find location-based keyword opportunities",
        systemPrompt: "You specialize in local SEO keyword research for businesses targeting specific geographic areas.",
        userPromptTemplate: "Find local keywords for {{businessType}} in {{location}}.",
      },
      {
        id: "question-keywords",
        name: "Question Keywords",
        description: "Find question-based queries for content",
        systemPrompt: "You identify question-based keywords (People Also Ask, featured snippets) for content optimization.",
        userPromptTemplate: "Find question keywords about: {{topic}}.",
      },
    ],
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
    templates: [
      {
        id: "meta-tags",
        name: "Meta Tags Optimization",
        description: "Create optimized title tags and meta descriptions",
        systemPrompt: "You craft compelling meta tags that improve CTR while containing target keywords naturally.",
        userPromptTemplate: "Write meta title and description for: {{pageTitle}}. Keywords: {{keywords}}.",
      },
      {
        id: "content-structure",
        name: "Content Structure",
        description: "Optimize heading hierarchy and content organization",
        systemPrompt: "You structure content with proper H1-H6 hierarchy, logical flow, and semantic organization.",
        userPromptTemplate: "Suggest content structure for: {{topic}}. Target keyword: {{keyword}}.",
      },
      {
        id: "internal-linking",
        name: "Internal Linking Strategy",
        description: "Build internal link structure",
        systemPrompt: "You identify internal linking opportunities to improve site architecture and link equity.",
        userPromptTemplate: "Suggest internal links for page: {{pageUrl}}. Existing content: {{contentList}}.",
      },
      {
        id: "schema-markup",
        name: "Schema Markup",
        description: "Generate structured data for rich results",
        systemPrompt: "You create Schema.org markup to help content appear in rich snippets and knowledge panels.",
        userPromptTemplate: "Generate schema for: {{contentType}}. Details: {{details}}.",
      },
    ],
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
    templates: [
      {
        id: "outreach-prospects",
        name: "Outreach Prospects",
        description: "Find link building opportunities",
        systemPrompt: "You identify websites suitable for guest posting, broken link building, and resource link building.",
        userPromptTemplate: "Find outreach prospects for: {{niche}}. Exclude: {{excludeList}}.",
      },
      {
        id: "competitor-backlinks",
        name: "Competitor Backlink Analysis",
        description: "Analyze competitor link profiles",
        systemPrompt: "You analyze where competitors get their backlinks and identify replicable opportunities.",
        userPromptTemplate: "Analyze backlinks of: {{competitorUrl}}. Find high-quality linking domains.",
      },
      {
        id: "link-quality-audit",
        name: "Link Quality Audit",
        description: "Evaluate backlink quality and risk",
        systemPrompt: "You assess backlinks for quality, relevance, and potential toxicity using domain authority metrics.",
        userPromptTemplate: "Audit these backlinks: {{backlinkList}}. Identify toxic links to disavow.",
      },
    ],
  },
  {
    id: "seo-audit",
    name: "SEO Auditor",
    description: "Comprehensive SEO site audits",
    icon: "🔍",
    category: "seo",
    prompts: {
      system: "You conduct comprehensive SEO audits covering technical, on-page, and off-page factors.",
    },
    templates: [
      {
        id: "technical-audit",
        name: "Technical SEO Audit",
        description: "Check site speed, crawlability, indexing",
        systemPrompt: "You identify technical issues affecting search visibility: page speed, mobile-friendliness, crawl errors, structured data issues.",
      },
      {
        id: "content-audit",
        name: "Content SEO Audit",
        description: "Analyze content for SEO effectiveness",
        systemPrompt: "You evaluate content quality, keyword targeting, readability, and topical authority.",
      },
      {
        id: "gap-analysis",
        name: "SEO Gap Analysis",
        description: "Compare performance against competitors",
        systemPrompt: "You identify SEO gaps between your site and competitors to prioritize improvements.",
      },
    ],
  },
]

export function getSeoSkills(): Skill[] {
  return SEO_SKILLS
}

export function getSeoSkillById(id: string): Skill | undefined {
  return SEO_SKILLS.find((skill) => skill.id === id)
}
