/**
 * 认证工具函数
 * 用于处理 Authorization header 的生成和凭证管理
 */

export interface AuthCredentials {
  email: string;
  password?: string;
  accessToken?: string;
}

/**
 * 从 localStorage 获取认证凭证
 */
export function getAuthCredentials(): AuthCredentials | null {
  if (typeof window === 'undefined') return null;

  try {
    const savedUser = localStorage.getItem('tarot_user');
    if (!savedUser) return null;

    const userData = JSON.parse(savedUser);
    const email = userData._authEmail || userData.email;
    const password = userData._authPassword;
    const accessToken = userData.accessToken || userData._authToken;

    if (accessToken) {
      return { email, accessToken, password };
    }

    if (email && password) {
      return { email, password };
    }

    return null;
  } catch (error) {
    console.error('Failed to get auth credentials:', error);
    return null;
  }
}

/**
 * 生成 Authorization header
 * @returns Authorization header 值或 null
 */
export function getAuthorizationHeader(): string | null {
  const credentials = getAuthCredentials();
  if (!credentials) return null;

  if (credentials.accessToken) {
    return `Bearer ${credentials.accessToken}`;
  }

  if (credentials.email && credentials.password) {
    return `Basic ${btoa(`${credentials.email}:${credentials.password}`)}`;
  }

  return null;
}

/**
 * 为 fetch 请求添加认证头
 * @param headers - 原始 headers 对象
 * @returns 包含 Authorization header 的新 headers 对象
 */
export function addAuthHeader(headers: HeadersInit = {}): HeadersInit {
  const authHeader = getAuthorizationHeader();

  if (authHeader) {
    return {
      ...headers,
      'Authorization': authHeader,
    };
  }

  return headers;
}

/**
 * 保存认证凭证到 localStorage
 */
export function saveAuthCredentials(
  userData: any,
  email: string,
  password?: string
): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem('tarot_user', JSON.stringify({
    ...userData,
    _authEmail: email,
    _authPassword: password,
  }));
}

/**
 * 清除认证凭证
 */
export function clearAuthCredentials(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('tarot_user');
}
