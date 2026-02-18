import { NextRequest, NextResponse } from 'next/server';
import { getCategoryById, getSkillsForCategory } from '@/lib/skills';

/**
 * GET /api/skills/[category]
 * Get skills for a specific category
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params;
    
    const categoryInfo = getCategoryById(category);
    if (!categoryInfo) {
      return NextResponse.json({ 
        error: 'Category not found',
        availableCategories: ['content', 'seo', 'marketing', 'support', 'data', 'social']
      }, { status: 404 });
    }

    const skills = getSkillsForCategory(category);

    return NextResponse.json({
      category: categoryInfo,
      skills,
    });
  } catch (error: any) {
    console.error('Skills category API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
