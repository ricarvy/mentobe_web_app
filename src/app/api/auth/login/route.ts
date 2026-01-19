import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database';
import { isDemoAccount, DEMO_ACCOUNT } from '@/config/demo-account';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password }: { email: string; password: string } = body;

    // 添加详细日志
    console.log('[Login Attempt] Email:', email);
    console.log('[Login Attempt] Password length:', password?.length);

    if (!email || !password) {
      console.log('[Login Failed] Missing credentials');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 优先检查演示账号
    const isDemo = isDemoAccount(email, password);
    console.log('[Login Check] Is demo account:', isDemo);

    // 检查是否匹配演示账号的邮箱，但密码或开关有问题
    const emailMatchesDemo = email === DEMO_ACCOUNT.email;
    if (emailMatchesDemo && !isDemo) {
      console.log('[Login Failed] Demo account email but invalid password or disabled');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (isDemo) {
      console.log('[Login Success] Demo account authenticated');
      return NextResponse.json({
        id: DEMO_ACCOUNT.id,
        username: DEMO_ACCOUNT.username,
        email: DEMO_ACCOUNT.email,
        isActive: DEMO_ACCOUNT.isActive,
        isDemo: true,
        unlimitedQuota: DEMO_ACCOUNT.unlimitedQuota,
      });
    }

    // 验证普通用户密码
    const user = await userManager.verifyPassword(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 检查用户是否激活
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }

    // 返回用户信息（不包括密码）
    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      isDemo: false,
    });
  } catch (error) {
    console.error('Error in login route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
