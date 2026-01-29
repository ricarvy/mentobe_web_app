import { NextRequest } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { tarotInterpretations, users } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import {
  withErrorHandler,
  createSuccessResponse,
  ApiError,
  ERROR_CODES,
} from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id: interpretationId } = await params;

    if (!interpretationId) {
      throw new ApiError(
        ERROR_CODES.INVALID_REQUEST,
        'Missing interpretation id'
      );
    }

    // 获取解读内容和用户名（不需要认证，因为这是公开分享）
    const db = await getDb();
    const result = await db
      .select({
        id: tarotInterpretations.id,
        userId: tarotInterpretations.userId,
        question: tarotInterpretations.question,
        spreadType: tarotInterpretations.spreadType,
        cards: tarotInterpretations.cards,
        interpretation: tarotInterpretations.interpretation,
        createdAt: tarotInterpretations.createdAt,
        username: users.username,
      })
      .from(tarotInterpretations)
      .leftJoin(users, eq(tarotInterpretations.userId, users.id))
      .where(eq(tarotInterpretations.id, interpretationId))
      .limit(1);

    if (!result || result.length === 0) {
      throw new ApiError(
        ERROR_CODES.NOT_FOUND,
        'Interpretation not found'
      );
    }

    const interpretation = result[0];

    // 如果username为null，使用默认值
    if (!interpretation.username) {
      interpretation.username = 'Mystic Seeker';
    }

    return Response.json(createSuccessResponse(interpretation));
  });
}
