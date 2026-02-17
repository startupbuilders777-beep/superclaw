import { NextRequest, NextResponse } from 'next/server';
import { getSkillById } from '@/lib/skills';

/**
 * GET /api/skills/[category]/[skillId]
 * Get a specific skill by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string; skillId: string }> }
) {
  try {
    const { skillId } = await params;
    
    const skill = getSkillById(skillId);
    if (!skill) {
      return NextResponse.json({ 
        error: 'Skill not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      skill,
    });
  } catch (error: any) {
    console.error('Skill API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
