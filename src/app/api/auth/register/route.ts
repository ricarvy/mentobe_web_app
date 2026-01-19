import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database';
import type { InsertUser } from '@/storage/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password }: { username: string; email: string; password: string } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email and password are required' },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const existingUser = await userManager.getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingEmail = await userManager.getUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // 创建用户
    const userData: InsertUser = {
      username,
      email,
      password,
    };

    const user = await userManager.createUser(userData);

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error('Error in register route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
