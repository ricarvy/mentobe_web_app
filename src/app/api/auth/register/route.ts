import { NextRequest } from 'next/server';
import { userManager } from '@/storage/database';
import type { InsertUser } from '@/storage/database';
import {
  withErrorHandler,
  createSuccessResponse,
  ApiError,
  ERROR_CODES,
} from '@/lib/api-response';

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { email, password }: { email: string; password: string } = body;

    if (!email || !password) {
      throw new ApiError(
        ERROR_CODES.INVALID_REQUEST,
        'Email and password are required'
      );
    }

    // 从邮箱中提取用户名（邮箱@前的部分）
    const username = email.split('@')[0];

    // 检查邮箱是否已存在
    const existingEmail = await userManager.getUserByEmail(email);
    if (existingEmail) {
      throw new ApiError(
        ERROR_CODES.USER_EXISTS,
        'Email already exists'
      );
    }

    // 创建用户
    const userData: InsertUser = {
      username,
      email,
      password,
    };

    const user = await userManager.createUser(userData);

    const responseData = {
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
    };
    return Response.json(createSuccessResponse(responseData, 'Registration successful'));
  });
}
