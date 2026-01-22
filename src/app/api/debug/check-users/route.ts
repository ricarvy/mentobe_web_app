import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users } from '@/storage/database/shared/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();

    // 查询所有用户
    const allUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10);

    return NextResponse.json({
      success: true,
      count: allUsers.length,
      users: allUsers.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        createdAt: u.createdAt,
      }))
    });
  } catch (error) {
    console.error('[Debug] Error checking users:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
