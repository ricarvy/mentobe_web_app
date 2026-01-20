import { NextRequest } from 'next/server';
import { llmConfig, validateLLMConfig } from '@/config/llm';
import { databaseConfig, validateDatabaseConfig } from '@/config/database';
import { appConfig, validateAppConfig } from '@/config/app';
import { DEMO_ACCOUNT, DEMO_ACCOUNT_ENABLED } from '@/config/demo-account';
import {
  withErrorHandler,
  createSuccessResponse,
} from '@/lib/api-response';

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        APP_NAME: process.env.APP_NAME,
        APP_URL: process.env.APP_URL,
        APP_VERSION: process.env.APP_VERSION,
      },
      llm: {
        config: {
          model: llmConfig.model,
          temperature: llmConfig.temperature,
          thinking: llmConfig.thinking,
          systemPromptLength: llmConfig.systemPrompt.length,
        },
        isValid: validateLLMConfig(),
        envVars: {
          LLM_MODEL: process.env.LLM_MODEL,
          LLM_TEMPERATURE: process.env.LLM_TEMPERATURE,
          LLM_MAX_TOKENS: process.env.LLM_MAX_TOKENS,
          LLM_THINKING: process.env.LLM_THINKING,
        },
      },
      database: {
        config: databaseConfig,
        isValid: validateDatabaseConfig(),
      },
      app: {
        config: appConfig,
        isValid: validateAppConfig(),
        envVars: {
          DAILY_QUOTA_FREE: process.env.DAILY_QUOTA_FREE,
          DAILY_QUOTA_PAID: process.env.DAILY_QUOTA_PAID,
          AI_INTERPRETATION_ENABLED: process.env.AI_INTERPRETATION_ENABLED,
        },
      },
      demoAccount: {
        enabled: DEMO_ACCOUNT_ENABLED,
        email: DEMO_ACCOUNT.email,
        passwordLength: DEMO_ACCOUNT.password.length,
        id: DEMO_ACCOUNT.id,
        envVars: {
          DEMO_ACCOUNT_ENABLED: process.env.DEMO_ACCOUNT_ENABLED,
          DEMO_ACCOUNT_EMAIL: process.env.DEMO_ACCOUNT_EMAIL,
          DEMO_ACCOUNT_PASSWORD: process.env.DEMO_ACCOUNT_PASSWORD ? '***' : undefined,
        },
      },
      imports: {
        'coze-coding-dev-sdk': {
          hasLLM: true,
          hasDatabase: true,
          hasStorage: true,
        },
      },
    };

    return Response.json(createSuccessResponse(debugInfo));
  });
}
