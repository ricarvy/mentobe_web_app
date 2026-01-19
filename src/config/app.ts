/**
 * 应用配置
 * 包含应用级别的通用配置
 */

export interface AppConfig {
  app: {
    name: string;
    description: string;
    url: string;
    version: string;
  };
  features: {
    dailyQuota: {
      free: number; // 免费用户每日限额
      paid: number; // 付费用户每日限额
    };
    aiInterpretation: {
      enabled: boolean;
    };
    socialLogin: {
      google: boolean;
      apple: boolean;
    };
  };
  limits: {
    maxQuestionLength: number;
    maxCardsPerReading: number;
    historyLimit: number; // 历史记录显示数量
  };
}

/**
 * 应用配置
 *
 * 可以通过环境变量覆盖：
 * - APP_NAME: 应用名称
 * - APP_URL: 应用URL
 * - APP_VERSION: 应用版本
 * - DAILY_QUOTA_FREE: 免费用户每日限额
 * - DAILY_QUOTA_PAID: 付费用户每日限额
 */
export const appConfig: AppConfig = {
  app: {
    name: process.env.APP_NAME || 'Mentob AI',
    description: process.env.APP_DESCRIPTION || 'AI-Powered Tarot Readings',
    url: process.env.APP_URL || 'http://localhost:5000',
    version: process.env.APP_VERSION || '1.0.0',
  },
  
  features: {
    dailyQuota: {
      free: Number(process.env.DAILY_QUOTA_FREE) || 3,
      paid: Number(process.env.DAILY_QUOTA_PAID) || 999,
    },
    aiInterpretation: {
      enabled: process.env.AI_INTERPRETATION_ENABLED !== 'false',
    },
    socialLogin: {
      google: process.env.SOCIAL_LOGIN_GOOGLE !== 'false',
      apple: process.env.SOCIAL_LOGIN_APPLE !== 'false',
    },
  },
  
  limits: {
    maxQuestionLength: Number(process.env.MAX_QUESTION_LENGTH) || 500,
    maxCardsPerReading: Number(process.env.MAX_CARDS_PER_READING) || 10,
    historyLimit: Number(process.env.HISTORY_LIMIT) || 50,
  },
};

/**
 * 验证应用配置是否有效
 */
export function validateAppConfig(): boolean {
  return !!(
    appConfig.app.name &&
    appConfig.app.url &&
    appConfig.features.dailyQuota.free >= 0 &&
    appConfig.features.dailyQuota.paid >= 0 &&
    appConfig.limits.maxQuestionLength > 0 &&
    appConfig.limits.maxCardsPerReading > 0
  );
}
