import { NextRequest } from 'next/server';
import { isDemoAccount, DEMO_ACCOUNT } from '@/config/demo-account';
import {
  withErrorHandler,
  createSuccessResponse,
  createErrorResponse,
  ApiError,
  ERROR_CODES,
} from '@/lib/api-response';

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    // 获取 Authorization header
    const authHeader = request.headers.get('authorization');
    console.log('[Login Attempt] Authorization header present:', !!authHeader);

    const body = await request.json();
    const { email, password }: { email: string; password: string } = body;

    // 添加详细日志
    console.log('[Login Attempt] Email:', email);
    console.log('[Login Attempt] Password length:', password?.length);

    // 验证 Authorization header
    if (authHeader) {
      try {
        // 解析 Basic Auth: "Basic <base64(email:password)>"
        const [scheme, credentials] = authHeader.split(' ');
        if (scheme === 'Basic' && credentials) {
          const decoded = Buffer.from(credentials, 'base64').toString('utf-8');
          const [headerEmail, headerPassword] = decoded.split(':');

          console.log('[Login Attempt] Header email:', headerEmail);
          console.log('[Login Attempt] Header password length:', headerPassword?.length);

          // 验证 header 中的凭证与请求体中的凭证是否一致
          if (headerEmail !== email || headerPassword !== password) {
            console.log('[Login Failed] Credentials mismatch between body and header');
            throw new ApiError(
              ERROR_CODES.UNAUTHORIZED,
              'Credentials mismatch'
            );
          }
        }
      } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error('[Authorization Parse Error]', error);
        // 解析失败时不阻断登录流程，继续使用请求体中的凭证
      }
    }

    if (!email || !password) {
      console.log('[Login Failed] Missing credentials');
      throw new ApiError(
        ERROR_CODES.INVALID_REQUEST,
        'Email and password are required'
      );
    }

    // 只支持演示账号登录
    let isDemo = false;
    try {
      isDemo = isDemoAccount(email, password);
    } catch (error) {
      console.error('[Demo Account Check Error]', error);
      isDemo = false;
    }
    console.log('[Login Check] Is demo account:', isDemo);

    // 检查是否匹配演示账号的邮箱，但密码或开关有问题
    const emailMatchesDemo = email === DEMO_ACCOUNT.email;
    if (emailMatchesDemo && !isDemo) {
      console.log('[Login Failed] Demo account email but invalid password or disabled');
      throw new ApiError(
        ERROR_CODES.INVALID_CREDENTIALS,
        'Invalid email or password'
      );
    }

    if (isDemo) {
      console.log('[Login Success] Demo account authenticated');
      const userData = {
        id: DEMO_ACCOUNT.id,
        username: DEMO_ACCOUNT.username,
        email: DEMO_ACCOUNT.email,
        isActive: DEMO_ACCOUNT.isActive,
        isDemo: true,
        unlimitedQuota: DEMO_ACCOUNT.unlimitedQuota,
      };
      return Response.json(createSuccessResponse(userData, 'Login successful'));
    }

    // 非演示账号返回错误（当前只支持演示账号）
    console.log('[Login Failed] Only demo account is supported');
    throw new ApiError(
      ERROR_CODES.INVALID_CREDENTIALS,
      'Invalid email or password'
    );
  });
}
