import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database';
import type { InsertUser } from '@/storage/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password }: { email: string; password: string } = body;

    // 仅验证邮箱格式
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // 从邮箱中提取用户名（邮箱@前的部分）
    const username = email.split('@')[0];

    // 检查邮箱是否已存在
    let existingEmail = await userManager.getUserByEmail(email);
    
    if (!existingEmail) {
      // 如果用户不存在，创建新用户（密码可以为任意值）
      const userData: InsertUser = {
        username,
        email,
        password: password || 'demo', // 密码可以是任意值，默认为 'demo'
      };

      existingEmail = await userManager.createUser(userData);
    }

    // 返回用户信息（无论新用户还是旧用户都直接登录）
    return NextResponse.json({
      id: existingEmail.id,
      username: existingEmail.username,
      email: existingEmail.email,
      isActive: existingEmail.isActive,
    });
  } catch (error) {
    console.error('Error in register route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
