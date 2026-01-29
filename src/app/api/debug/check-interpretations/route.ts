import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { tarotInterpretations } from '@/storage/database/shared/schema';
import { desc } from 'drizzle-orm';

export async function GET(_request: NextRequest) {
  try {
    const db = await getDb();

    // 查询所有解读记录
    const allInterpretations = await db
      .select()
      .from(tarotInterpretations)
      .orderBy(desc(tarotInterpretations.createdAt))
      .limit(10);

    return NextResponse.json({
      success: true,
      count: allInterpretations.length,
      interpretations: allInterpretations.map(i => ({
        id: i.id,
        userId: i.userId,
        question: i.question,
        spreadType: i.spreadType,
        createdAt: i.createdAt,
      }))
    });
  } catch (error) {
    console.error('[Debug] Error checking interpretations:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
