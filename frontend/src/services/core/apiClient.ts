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
}

/**
 * Función genérica de solicitud API.
 * Se encarga de la conexión, cabeceras, y manejo de errores de red/JSON.
 */
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    } as any);

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
      } else {
        if (!response.ok) {
          return {
            success: false,
            error: `Server returned non-JSON response. Status: ${status}. URL: ${url}`,
            status: status,
            rawResponse: responseText.substring(0, 1000),
            url: url,
          };
        }
      }
    } catch (parseError: any) {
      return {
        success: false,
        error: `Invalid JSON response from server (Status: ${status}). ${parseError.toString()}`,
        status: status,
        rawResponse: responseText.substring(0, 1000),
        url: url,
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error:
          data.message || data.error || `Request failed with status ${status}`,
        status: status,
        data: data,
      };
    }

    // Exit response
    return {
      success: true,
      data: data,
      status: status,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error. Please check your connection.',
      status: 0,
    };
  }
};
