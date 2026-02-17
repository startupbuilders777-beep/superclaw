// Data Analyst Skills Pack
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

export const DATA_SKILLS: Skill[] = [
  {
    id: "data-query",
    name: "Data Query",
    description: "Query and analyze data from databases",
    icon: "🔍",
    category: "data",
    prompts: {
      system: "You are a data analyst. Write efficient queries to extract insights from data. Explain results in clear, actionable terms.",
    },
  },
  {
    id: "data-reports",
    name: "Report Generator",
    description: "Generate data reports and summaries",
    icon: "📊",
    category: "data",
    prompts: {
      system: "You are a reporting specialist. Create clear, comprehensive data reports with visualizations and actionable insights.",
    },
  },
  {
    id: "data-viz",
    name: "Visualization",
    description: "Create data visualizations and charts",
    icon: "📈",
    category: "data",
    prompts: {
      system: "You are a data visualization expert. Create compelling charts and graphs that communicate data insights effectively.",
    },
  },
]

export function getDataSkills(): Skill[] {
  return DATA_SKILLS
}

export function getDataSkillById(id: string): Skill | undefined {
  return DATA_SKILLS.find((skill) => skill.id === id)
}
