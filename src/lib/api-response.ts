/**
 * 统一的 API 响应格式
 */

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * 创建成功响应
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiSuccessResponse<T> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return response;
}

/**
 * 创建错误响应
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: any
): ApiErrorResponse {
  const error: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };

  return error;
}

/**
 * 错误代码常量
 */
export const ERROR_CODES = {
  // 通用错误
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',

  // 认证相关
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_EXISTS: 'USER_EXISTS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',

  // 塔罗牌相关
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  INVALID_CARDS: 'INVALID_CARDS',
  INVALID_SPREAD: 'INVALID_SPREAD',
  INTERPRETATION_FAILED: 'INTERPRETATION_FAILED',

  // LLM 相关
  LLM_ERROR: 'LLM_ERROR',
  LLM_TIMEOUT: 'LLM_TIMEOUT',
  LLM_RATE_LIMIT: 'LLM_RATE_LIMIT',

  // 数据库相关
  DATABASE_ERROR: 'DATABASE_ERROR',
  DATABASE_CONNECTION_ERROR: 'DATABASE_CONNECTION_ERROR',

  // 网络相关
  NETWORK_ERROR: 'NETWORK_ERROR',
  NO_READER: 'NO_READER',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * API 错误类
 */
export class ApiError extends Error {
  public code: ErrorCode;
  public details?: any;

  constructor(code: ErrorCode, message: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }

  toResponse(): ApiErrorResponse {
    return createErrorResponse(this.code, this.message, this.details);
  }
}

/**
 * 包装异步处理器，自动捕获错误并返回统一格式的响应
 */
export function withErrorHandler(
  handler: () => Promise<Response> | Response
): Promise<Response> {
  return Promise.resolve().then(handler).catch((error) => {
    console.error('[API Error]', error);

    let code: ErrorCode = ERROR_CODES.INTERNAL_ERROR;
    let message = '服务器繁忙，请稍后再试';
    let details = error instanceof Error ? error.message : String(error);

    // 如果是自定义 API 错误
    if (error instanceof ApiError) {
      code = error.code;
      message = error.message;
      details = error.details;
    }

    const response = createErrorResponse(code, message, details);
    return Response.json(response, { status: 200 });
  });
}
