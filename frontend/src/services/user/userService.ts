import { AuthResponse } from '@/types/interface/auth/authResponse';
import { apiRequest } from '../core/apiClient';
import { responseNormalizer } from '../core/responseNormalizer';
import { getAuthToken } from '../storage/authStorage';

export interface PublicUserSummary {
  id: string;
  uid?: string;
  name?: string;
  username?: string;
  photo?: string;
  bio?: string;
  interests?: string[];
}

export interface UserSearchResponse {
  success: boolean;
  users?: PublicUserSummary[];
  error?: string;
}

/**
 * Get profile by id
 * GET /users/:uid
 */
export const getUserById = async (userId: string): Promise<AuthResponse> => {
  const apiResponse = await apiRequest(`/users/${userId}`, {
    method: 'GET',
  });
  return responseNormalizer(apiResponse);
};

/**
 * Update profile
 * PATCH /users/me
 */
export const updateCurrentUser = async (
  userData: Partial<any>,
): Promise<AuthResponse> => {
  const apiResponse = await apiRequest('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });
  return responseNormalizer(apiResponse);
};

/**
 * Get user profile with multiple endpoints
 * GET /users/me o GET /auth/me
 */
export const getCurrentUser = async (): Promise<AuthResponse> => {
  const token = getAuthToken();

  if (!token) {
    return {
      success: false,
      error: 'No authentication token available. Please login again.',
    };
  }

  let usersMeResponse = await apiRequest('/users/me', { method: 'GET' });

  if (usersMeResponse.success) {
    const normalized = responseNormalizer(usersMeResponse);
    if (normalized.user) {
      return normalized;
    }
  }

  let authMeResponse = await apiRequest('/auth/me', { method: 'GET' });

  if (authMeResponse.success) {
    const normalized = responseNormalizer(authMeResponse);
    if (normalized.user) {
      return normalized;
    }
  }

  if (usersMeResponse.success || authMeResponse.success) {
    return responseNormalizer(
      usersMeResponse.success ? usersMeResponse : authMeResponse,
    );
  }

  return responseNormalizer(usersMeResponse);
};

export const searchUsers = async (
  query: string,
  limit = 20,
): Promise<UserSearchResponse> => {
  const trimmedQuery = query.trim();
  const params = new URLSearchParams();
  if (trimmedQuery.length > 0) {
    params.append('q', trimmedQuery);
  }
  params.append('limit', limit.toString());

  const response = await apiRequest(`/users?${params.toString()}`, {
    method: 'GET',
  });

  if (!response.success) {
    return {
      success: false,
      error: response.error || 'No se pudieron buscar usuarios',
    };
  }

  return {
    success: true,
    users: (response.data?.users || []) as PublicUserSummary[],
  };
};
