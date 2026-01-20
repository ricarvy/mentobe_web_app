import { NextRequest } from 'next/server';
import { tarotInterpretationManager } from '@/storage/database';
import {
  withErrorHandler,
  createSuccessResponse,
  ApiError,
  ERROR_CODES,
} from '@/lib/api-response';

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      throw new ApiError(
        ERROR_CODES.INVALID_REQUEST,
        'Missing userId'
      );
    }

    const interpretations = await tarotInterpretationManager.getInterpretationsByUserId(userId, 20);

    return Response.json(createSuccessResponse({ interpretations }));
  });
}
