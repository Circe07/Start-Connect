import { AuthResponse } from '@/types/interface/auth/authResponse';
import { RegisterRequest } from '@/types/interface/auth/registerRequest';
import { LoginRequest } from '@/types/interface/auth/loginRequest';
import { apiRequest } from '../core/apiClient';
import { setAuthToken } from '../storage/authStorage';
import { responseNormalizer } from '../core/responseNormalizer';

/**
 * Register new user
 * POST /auth/register
 */
export const registerUser = async (
  userData: RegisterRequest,
): Promise<AuthResponse> => {
  const apiResponse = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  const response = responseNormalizer(apiResponse);

  if (response.success && response.token) {
    setAuthToken(response.token);
  }

  return response;
};

/**
 * Login to user
 * POST /auth/login
 */
export const loginUser = async (
  credentials: LoginRequest,
): Promise<AuthResponse> => {
  const apiResponse = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  const response = responseNormalizer(apiResponse);

  if (response.success && response.token) {
    setAuthToken(response.token);
  }

  return response;
};

/**
 * Logout to user
 * POST /auth/logout
 */
export const logoutUser = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  const response = await apiRequest('/auth/logout', {
    method: 'POST',
  });

  if (response.success) {
    setAuthToken(null);
  }

  return response;
};

/**
 * Change password
 * POST /auth/change-password
 */
export const changePassword = async (
  email: string,
): Promise<{
  success: boolean;
  error?: string;
}> => {
  return apiRequest('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
};
