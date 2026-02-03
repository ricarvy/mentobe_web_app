/**
 * 统一的 API 客户端工具
 */

import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
} from './api-response';
import { addAuthHeader, clearAuthCredentials } from './auth';
import { getApiUrl } from '@/config';

/**
 * 语言代码映射
 * 前端语言代码 -> 后端语言代码
 */
const LANG_MAP: Record<string, string> = {
  zh: 'cn',
  en: 'en',
  ja: 'jp',
};

/**
 * 获取当前语言代码
 */
function getCurrentLang(): string {
  // 优先从 localStorage 读取
  const savedLang = localStorage.getItem('tarot_language');
  if (savedLang && LANG_MAP[savedLang]) {
    return LANG_MAP[savedLang];
  }

  // 检测浏览器语言
  const browserLang = navigator.language.split('-')[0];
  if (LANG_MAP[browserLang]) {
    return LANG_MAP[browserLang];
  }

  // 默认返回英文
  return 'en';
}

/**
 * 为 URL 添加语言参数
 */
function addLangParam(url: string): string {
  const lang = getCurrentLang();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}lang=${lang}`;
}

/**
 * API 请求配置
 */
export interface ApiRequestConfig extends RequestInit {
  requireAuth?: boolean;
}

/**
 * API 请求错误
 */
export class ApiRequestError extends Error {
  public code: string;
  public details?: unknown;
  public isServerError: boolean;

  constructor(
    message: string,
    code: string,
    details?: unknown,
    isServerError = false
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
    this.details = details;
    this.isServerError = isServerError;
  }
}

/**
 * 发送 API 请求
 * @param url - 请求地址
 * @param config - 请求配置
 * @returns Promise<T> - 返回数据
 * @throws ApiRequestError - 请求失败时抛出错误
 */
export async function apiRequest<T = unknown>(
  url: string,
  config: ApiRequestConfig = {}
): Promise<T> {
  const { requireAuth = true, ...requestConfig } = config;

  // 为 URL 添加语言参数
  const urlWithLang = addLangParam(url);

  // 构建完整的API URL
  const fullUrl = getApiUrl(urlWithLang);

  // 添加 Authorization header（如果需要）
  let headers: HeadersInit = requestConfig.headers || {};

  if (requireAuth) {
    headers = addAuthHeader(headers);
  }

  // 确保 Content-Type 为 application/json
  if (!(headers instanceof Headers)) {
    headers = {
      ...headers,
      'Content-Type': 'application/json',
    };
  } else if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    // 添加详细日志
    const requestContentType = headers instanceof Headers ? headers.get('Content-Type') : (headers as Record<string, string>)['Content-Type'];
    const hasAuth = headers instanceof Headers ? headers.has('Authorization') : !!(headers as Record<string, string>)['Authorization'];

    console.log('[API Request]', {
      url: fullUrl,
      method: requestConfig.method || 'GET',
      requireAuth,
      headers: {
        'Content-Type': requestContentType,
        'Authorization': hasAuth ? '***' : 'N/A',
      },
      hasBody: !!requestConfig.body,
    });

    const response = await fetch(fullUrl, {
      ...requestConfig,
      headers,
    });

    console.log('[API Response]', {
      url: fullUrl,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      contentType: response.headers.get('content-type'),
    });

    // 尝试解析响应
    let responseData: ApiResponse<T>;

    // 检查响应是否为 JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      // 如果不是 JSON，读取文本并包装为错误响应
      const text = await response.text();
      // 如果是 403 且不是 JSON，那肯定是 Token 过期或者网关拦截
      if (response.status === 403) {
        if (typeof window !== 'undefined') {
          clearAuthCredentials();
          window.location.href = '/login';
        }
        throw new ApiRequestError(
          '登录已过期，请重新登录',
          'AUTH_EXPIRED',
          null,
          false
        );
      }

      console.error('[API Error] Non-JSON response:', text);
      responseData = {
        success: false,
        error: {
          code: 'INVALID_RESPONSE',
          message: '服务器繁忙，请稍后再试',
          details: text,
        },
      };
    }

    // 检查响应是否成功
    if (responseData.success) {
      return responseData.data;
    } else {
      // 响应包含错误信息
      console.error('[API Error]', responseData);

      // Handle FastAPI style error structure { detail: { code: string, message: string } }
      const rawResponse = responseData as any;
      if (rawResponse.detail && rawResponse.detail.code) {
        // 如果是 403 且是特定错误码，不要清除 token
        if (response.status === 403) {
           // 这些错误码不清除 token
           const keepTokenCodes = ['AUTH_SOCIAL_ACCOUNT', 'AUTH_ACCOUNT_DISABLED'];
           if (!keepTokenCodes.includes(rawResponse.detail.code)) {
             // 其他 403 错误（如 AUTH_EXPIRED 或未知的 403）才清除 token
             if (typeof window !== 'undefined') {
                clearAuthCredentials();
                window.location.href = '/login';
              }
           }
        }

        throw new ApiRequestError(
          rawResponse.detail.message || 'Unknown error',
          rawResponse.detail.code,
          rawResponse.detail,
          true
        );
      }

      // Handle standard ApiResponse error structure
      if (responseData.error) {
        throw new ApiRequestError(
          responseData.error.message,
          responseData.error.code,
          responseData.error.details,
          true
        );
      }
      
      // 如果是 403 但没有特定的错误结构，按默认过期处理
      if (response.status === 403) {
        if (typeof window !== 'undefined') {
          clearAuthCredentials();
          window.location.href = '/login';
        }
        throw new ApiRequestError(
          '登录已过期，请重新登录',
          'AUTH_EXPIRED',
          null,
          false
        );
      }

      // Fallback
      throw new ApiRequestError(
        '服务器繁忙，请稍后再试',
        'UNKNOWN_ERROR',
        responseData,
        true
      );
    }
  } catch (error) {
    // 网络错误或其他异常
    if (error instanceof ApiRequestError) {
      throw error;
    }

    console.error('[API Network Error]', error);
    throw new ApiRequestError(
      '网络错误，请检查连接',
      'NETWORK_ERROR',
      error instanceof Error ? error.message : String(error),
      true
    );
  }
}

/**
 * 发送流式 API 请求
 * @param url - 请求地址
 * @param config - 请求配置
 * @param onChunk - 接收到数据块时的回调
 * @param onComplete - 完成时的回调
 * @param onError - 错误时的回调
 */
export async function streamApiRequest(
  url: string,
  config: ApiRequestConfig = {},
  onChunk: (text: string) => void,
  onComplete?: (fullText: string) => void,
  onError?: (error: ApiRequestError) => void
): Promise<void> {
  const { requireAuth = true, ...requestConfig } = config;

  // 为 URL 添加语言参数
  const urlWithLang = addLangParam(url);

  // 构建完整的API URL
  const fullUrl = getApiUrl(urlWithLang);

  // 添加 Authorization header（如果需要）
  let headers: HeadersInit = requestConfig.headers || {};

  if (requireAuth) {
    headers = addAuthHeader(headers);
  }

  // 确保 Content-Type 为 application/json
  if (!(headers instanceof Headers)) {
    headers = {
      ...headers,
      'Content-Type': 'application/json',
    };
  } else if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    // 添加详细日志
    const requestContentType = headers instanceof Headers ? headers.get('Content-Type') : (headers as Record<string, string>)['Content-Type'];
    const hasAuth = headers instanceof Headers ? headers.has('Authorization') : !!(headers as Record<string, string>)['Authorization'];

    console.log('[API Request]', {
      url: fullUrl,
      method: requestConfig.method || 'GET',
      requireAuth,
      headers: {
        'Content-Type': requestContentType,
        'Authorization': hasAuth ? '***' : 'N/A',
      },
      hasBody: !!requestConfig.body,
    });

    const response = await fetch(fullUrl, {
      ...requestConfig,
      headers,
    });

    // 处理 403 Forbidden
    if (response.status === 403) {
      if (typeof window !== 'undefined') {
        clearAuthCredentials();
        window.location.href = '/login';
      }
      const error = new ApiRequestError(
        '登录已过期，请重新登录',
        'AUTH_EXPIRED',
        null,
        false
      );
      if (onError) {
        onError(error);
      }
      return;
    }

    console.log('[API Response]', {
      url: fullUrl,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      contentType: response.headers.get('content-type'),
    });

    // 检查响应是否为流式响应
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      // 如果是 JSON，说明发生了错误
      const errorData: ApiErrorResponse = await response.json();
      if (!errorData.success) {
        console.error('[Stream API Error]', errorData.error);
        const error = new ApiRequestError(
          errorData.error.message,
          errorData.error.code,
          errorData.error.details,
          true
        );
        if (onError) {
          onError(error);
        }
        throw error;
      }
    }

    // 流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      throw new ApiRequestError('无法读取响应流', 'NO_READER');
    }

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      fullText += text;
      onChunk(text);
    }

    if (onComplete) {
      onComplete(fullText);
    }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      if (onError) {
        onError(error);
      }
      throw error;
    }

    console.error('[Stream API Network Error]', error);
    const networkError = new ApiRequestError(
      '网络错误，请检查连接',
      'NETWORK_ERROR',
      error instanceof Error ? error.message : String(error),
      true
    );
    if (onError) {
      onError(networkError);
    }
    throw networkError;
  }
}
