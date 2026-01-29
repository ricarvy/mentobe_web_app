import { NextRequest } from 'next/server';
import { DEMO_ACCOUNT, DEMO_ACCOUNT_ENABLED } from '@/config/demo-account';
import {
  withErrorHandler,
  createSuccessResponse,
} from '@/lib/api-response';

export async function GET(_request: NextRequest) {
  return withErrorHandler(async () => {
    const demoAccountInfo = {
      enabled: DEMO_ACCOUNT_ENABLED,
      email: DEMO_ACCOUNT.email,
      passwordLength: DEMO_ACCOUNT.password.length,
      passwordMasked: DEMO_ACCOUNT.password.replace(/./g, '*'),
      passwordChars: Array.from(DEMO_ACCOUNT.password).map(c => ({
        char: c,
        code: c.charCodeAt(0),
      })),
      environment: process.env.NODE_ENV,
      envDemoEmail: process.env.DEMO_ACCOUNT_EMAIL,
      envDemoPassword: process.env.DEMO_ACCOUNT_PASSWORD ? 'SET' : 'NOT_SET',
      envDemoEnabled: process.env.DEMO_ACCOUNT_ENABLED,
    };
    return Response.json(createSuccessResponse(demoAccountInfo));
  });
}
