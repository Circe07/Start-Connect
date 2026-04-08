import API_CONFIG from '@/api/api-config';
import { getAuthToken } from '../storage/authStorage';

/**
 * Interfaz de la respuesta base que incluye el éxito y el estado HTTP
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
  rawResponse?: any;
  url?: string;
  headers?: Headers;
}

/**
 * Función genérica de solicitud API.
 * Se encarga de la conexión, cabeceras, y manejo de errores de red/JSON.
 */
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse> => {
  const resolvedEndpoint = resolveEndpoint(endpoint);
  const url = `${API_CONFIG.BASE_URL}${resolvedEndpoint}`;
  const token = getAuthToken();

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-request-id': createRequestId(),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    let result = await performRequest(url, options, requestHeaders);

    if (
      result.status === 401 &&
      token &&
      resolvedEndpoint !== '/v1/auth/refresh'
    ) {
      const refreshOk = await attemptRefresh(token, requestHeaders);
      if (refreshOk) {
        result = await performRequest(url, options, requestHeaders);
      }
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error. Please check your connection.',
      status: 0,
    };
  }
};

const V1_PREFIX = '/v1';
const V1_RESOURCE_PREFIXES = ['/auth', '/users', '/groups', '/discover'];

const resolveEndpoint = (endpoint: string): string => {
  if (!endpoint.startsWith('/')) {
    return endpoint;
  }

  if (endpoint.startsWith(V1_PREFIX)) {
    return endpoint;
  }

  const shouldUseV1 = V1_RESOURCE_PREFIXES.some(prefix =>
    endpoint.startsWith(prefix),
  );

  return shouldUseV1 ? `${V1_PREFIX}${endpoint}` : endpoint;
};

const createRequestId = (): string =>
  `rn-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

const extractErrorMessage = (data: any): string | undefined => {
  if (!data) {
    return undefined;
  }

  if (typeof data.error === 'string') {
    return data.error;
  }

  if (typeof data.error?.message === 'string') {
    return data.error.message;
  }

  if (typeof data.message === 'string') {
    return data.message;
  }

  return undefined;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (
  url: string,
  options: RequestInit,
): Promise<Response> => {
  const maxAttempts = 2;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, options as any);
      if (response.status >= 500 && attempt < maxAttempts) {
        await sleep(200 * attempt);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(200 * attempt);
        continue;
      }
    }
  }

  throw lastError || new Error('Network error. Please check your connection.');
};

const performRequest = async (
  url: string,
  options: RequestInit,
  headers: Record<string, string>,
): Promise<ApiResponse> => {
  const response = await fetchWithRetry(url, {
    ...options,
    headers,
  } as any);

  const responseHeaders = response.headers;
  const responseText = await response.text();
  const status = response.status;
  let data: any = {};

  try {
    const trimmedText = responseText.trim();
    const looksLikeJson =
      trimmedText.startsWith('{') || trimmedText.startsWith('[');

    if (looksLikeJson && trimmedText.length > 0) {
      data = JSON.parse(responseText);
    } else if (trimmedText.length === 0) {
      data = {};
    } else if (!response.ok) {
      return {
        success: false,
        error: `Server returned non-JSON response. Status: ${status}. URL: ${url}`,
        status,
        rawResponse: responseText.substring(0, 1000),
        url,
      };
    }
  } catch (parseError: any) {
    return {
      success: false,
      error: `Invalid JSON response from server (Status: ${status}). ${parseError.toString()}`,
      status,
      rawResponse: responseText.substring(0, 1000),
      url,
    };
  }

  if (!response.ok || data.success === false) {
    const structuredError = extractErrorMessage(data);
    return {
      success: false,
      error: structuredError || `Request failed with status ${status}`,
      status,
      data: data?.data ?? data,
      headers: responseHeaders,
    };
  }

  return {
    success: true,
    data: data?.data ?? data,
    status,
    headers: responseHeaders,
  };
};

const attemptRefresh = async (
  currentToken: string,
  currentHeaders: Record<string, string>,
): Promise<boolean> => {
  const refreshUrl = `${API_CONFIG.BASE_URL}/v1/auth/refresh`;
  const refreshHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-request-id': createRequestId(),
    Authorization: `Bearer ${currentToken}`,
  };

  try {
    const refreshResponse = await performRequest(
      refreshUrl,
      { method: 'POST' },
      refreshHeaders,
    );

    if (!refreshResponse.success) {
      return false;
    }

    const refreshedToken =
      refreshResponse.data?.token || refreshResponse.data?.accessToken;

    if (!refreshedToken || typeof refreshedToken !== 'string') {
      return false;
    }

    currentHeaders.Authorization = `Bearer ${refreshedToken}`;
    return true;
  } catch {
    return false;
  }
};
