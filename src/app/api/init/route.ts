import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database';

// 默认管理员账号配置
const DEFAULT_ADMIN = {
  username: 'admin',
  email: 'admin@mentobai.com',
  password: 'Admin123!', // 生产环境应该使用环境变量
};

export async function POST(request: NextRequest) {
  try {
    // 检查是否已经存在管理员账号
    const existingAdmin = await userManager.getUserByEmail(DEFAULT_ADMIN.email);
    
    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin user already exists',
        user: {
          id: existingAdmin.id,
          username: existingAdmin.username,
          email: existingAdmin.email,
        }
      });
    }

    // 创建默认管理员账号
    const admin = await userManager.createUser({
      username: DEFAULT_ADMIN.username,
      email: DEFAULT_ADMIN.email,
      password: DEFAULT_ADMIN.password,
    });

    console.log('Default admin user created successfully:', {
      id: admin.id,
      username: admin.username,
      email: admin.email,
    });

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
      credentials: {
        email: DEFAULT_ADMIN.email,
        password: DEFAULT_ADMIN.password,
      }
    });
  } catch (error) {
    console.error('Error in init route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
