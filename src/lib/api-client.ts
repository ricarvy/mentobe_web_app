/**
 * 统一的 API 客户端工具
 */

import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
} from './api-response';
import { addAuthHeader } from './auth';
import { getApiUrl } from '@/config';

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
  public details?: any;
  public isServerError: boolean;

  constructor(
    message: string,
    code: string,
    details?: any,
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
export async function apiRequest<T = any>(
  url: string,
  config: ApiRequestConfig = {}
): Promise<T> {
  const { requireAuth = true, ...requestConfig } = config;

  // 构建完整的API URL
  const fullUrl = getApiUrl(url);

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
      console.error('[API Error]', responseData.error);
      throw new ApiRequestError(
        responseData.error.message,
        responseData.error.code,
        responseData.error.details,
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

  // 构建完整的API URL
  const fullUrl = getApiUrl(url);

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
