/**
 * 后端服务配置
 * 管理后端API的基础URL和相关配置
 */

/**
 * 后端服务配置
 */
export interface BackendConfig {
  baseURL: string;
  timeout?: number;
}

/**
 * 后端API基础配置
 *
 * 新后端服务部署地址: http://120.76.142.91:8901/
 *
 * API端点列表：
 * - POST /api/auth/login - 用户登录
 * - POST /api/auth/register - 用户注册
 * - GET /api/auth/quota - 查询配额
 * - POST /api/tarot/interpret - AI塔罗解读（流式）
 * - GET /api/tarot/history - 解读历史记录
 * - GET /api/tarot/suggest - 相关问题建议
 */
export const backendConfig: BackendConfig = {
  // 从环境变量读取，如果没有则使用默认值
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://120.76.142.91:8901',

  // 请求超时时间（毫秒）
  timeout: Number(process.env.NEXT_PUBLIC_BACKEND_TIMEOUT) || 30000,
};

/**
 * 获取完整的API端点URL
 * @param endpoint - API端点路径（例如：'/api/auth/login'）
 * @returns 完整的API URL
 */
export function getApiUrl(endpoint: string): string {
  // 确保endpoint以/开头
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${backendConfig.baseURL}${normalizedEndpoint}`;
}

/**
 * 验证后端配置是否有效
 */
export function validateBackendConfig(): boolean {
  return !!(backendConfig.baseURL && backendConfig.baseURL.startsWith('http'));
}
