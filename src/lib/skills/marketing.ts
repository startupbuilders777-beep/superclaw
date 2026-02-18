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
  templates?: SkillTemplate[]
}

export interface SkillTemplate {
  id: string
  name: string
  description: string
  systemPrompt: string
  userPromptTemplate?: string
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
    templates: [
      {
        id: "google-ads",
        name: "Google Ads",
        description: "Write search ads with headlines and descriptions",
        systemPrompt: "You craft high-converting Google Ads with attention-grabbing headlines within character limits and persuasive descriptions.",
        userPromptTemplate: "Write Google Ads for: {{product}}. Keywords: {{keywords}}. USP: {{uniqueSellingPoint}}.",
      },
      {
        id: "facebook-ads",
        name: "Facebook/Instagram Ads",
        description: "Create social media ad copy",
        systemPrompt: "You write engaging Facebook and Instagram ad copy that works within the platform's tone and character limits.",
        userPromptTemplate: "Create FB/IG ads for: {{product}}. Target: {{audience}}. Goal: {{campaignGoal}}.",
      },
      {
        id: "linkedin-ads",
        name: "LinkedIn Ads",
        description: "B2B focused LinkedIn advertising",
        systemPrompt: "You create professional, B2B-focused LinkedIn ad copy that resonates with decision-makers.",
      },
      {
        id: "retargeting",
        name: "Retargeting Ads",
        description: "Write ads for warm audiences",
        systemPrompt: "You craft retargeting ads that remind warm audiences of products they've seen and encourage conversion.",
      },
    ],
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
    templates: [
      {
        id: "welcome-series",
        name: "Welcome Sequence",
        description: "Onboard new subscribers with welcome emails",
        systemPrompt: "You create warm, engaging welcome sequences that introduce your brand and set up new subscribers for success.",
        userPromptTemplate: "Create a {{number}}-email welcome series for: {{businessType}}. Key goal: {{goal}}.",
      },
      {
        id: "abandoned-cart",
        name: "Abandoned Cart Recovery",
        description: "Recover lost sales with cart abandonment emails",
        systemPrompt: "You write persuasive abandoned cart emails that create urgency and remind customers of their incomplete purchase.",
      },
      {
        id: "promotional",
        name: "Promotional Emails",
        description: "Announce sales and special offers",
        systemPrompt: "You craft compelling promotional emails that drive immediate action with clear CTAs and urgency.",
      },
      {
        id: "newsletter",
        name: "Newsletter",
        description: "Regular newsletter content",
        systemPrompt: "You create engaging newsletters with valuable content, industry insights, and brand updates.",
      },
    ],
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
    templates: [
      {
        id: "product-launch",
        name: "Product Launch",
        description: "Landing page for new product launch",
        systemPrompt: "You write compelling product launch pages that build anticipation and drive pre-orders or initial sales.",
      },
      {
        id: "lead-magnet",
        name: "Lead Magnet Landing",
        description: "Capture leads with valuable content offers",
        systemPrompt: "You create high-converting lead magnet landing pages that clearly communicate value and drive sign-ups.",
        userPromptTemplate: "Write a landing page for: {{leadMagnet}}. Target: {{audience}}.",
      },
      {
        id: "webinar-signup",
        name: "Webinar Registration",
        description: "Drive registrations for webinars",
        systemPrompt: "You craft persuasive webinar registration pages that clearly communicate value and encourage sign-ups.",
      },
      {
        id: "pricing-page",
        name: "Pricing Page",
        description: "Overcome pricing objections",
        systemPrompt: "You write pricing page copy that justifies pricing, highlights value, and reduces purchase anxiety.",
      },
    ],
  },
  {
    id: "marketing-cta",
    name: "Call-to-Action Optimization",
    description: "Create compelling CTAs for all channels",
    icon: "👆",
    category: "marketing",
    prompts: {
      system: "You specialize in creating high-converting call-to-action copy across all marketing channels.",
    },
    templates: [
      {
        id: "button-copy",
        name: "Button Copy",
        description: "Optimize CTA button text",
        systemPrompt: "You write action-oriented button copy that drives clicks and conversions.",
      },
      {
        id: "cta-sequence",
        name: "Multi-Step CTA",
        description: "Create progressive CTAs",
        systemPrompt: "You design multi-step CTAs that guide users through a conversion funnel.",
      },
    ],
  },
]

export function getMarketingSkills(): Skill[] {
  return MARKETING_SKILLS
}

export function getMarketingSkillById(id: string): Skill | undefined {
  return MARKETING_SKILLS.find((skill) => skill.id === id)
}
