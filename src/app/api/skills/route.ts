import { NextResponse } from 'next/server';
import { SKILL_CATEGORIES, getAllSkills, getSkillById, getCategoryById } from '@/lib/skills';

/**
 * GET /api/skills
 * Get all skill categories and their skills
 */
export async function GET() {
  try {
    return NextResponse.json({
      categories: SKILL_CATEGORIES,
      allSkills: getAllSkills(),
    });
  } catch (error: any) {
    console.error('Skills API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
