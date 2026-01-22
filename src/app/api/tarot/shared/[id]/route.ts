import { NextRequest } from 'next/server';
import { tarotInterpretationManager } from '@/storage/database';
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

    // 获取解读内容（不需要认证，因为这是公开分享）
    const interpretation = await tarotInterpretationManager.getInterpretationById(interpretationId);

    if (!interpretation) {
      throw new ApiError(
        ERROR_CODES.NOT_FOUND,
        'Interpretation not found'
      );
    }

    return Response.json(createSuccessResponse(interpretation));
  });
}
