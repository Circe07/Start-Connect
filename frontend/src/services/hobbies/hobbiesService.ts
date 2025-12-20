import { apiRequest } from '../core/apiClient';
import { AuthResponse } from '@/types/interface/auth/authResponse';

/**
 * Get all available hobbies
 * GET /hobbies
 */
export const getAllHobbies = async (): Promise<AuthResponse> => {
  const apiResponse = await apiRequest('/hobbies', { method: 'GET' });
  return apiResponse;
};

/**
 * Get user's hobbies
 * GET /hobbies/me
 */
export const getMyHobbies = async (): Promise<AuthResponse> => {
  const apiResponse = await apiRequest('/hobbies/me', { method: 'GET' });
  return apiResponse;
};

/**
 * Add hobbies to user
 * POST /hobbies/me
 */
export const addHobbiesToUser = async (
  hobbies: string[],
): Promise<AuthResponse> => {
  const apiResponse = await apiRequest('/hobbies/me', {
    method: 'POST',
    body: JSON.stringify({ hobbies }),
  });
  return apiResponse;
};

/**
 * Get users by hobby
 * GET /hobbies/:hobbyId/users
 */
export const getUsersByHobby = async (
  hobbyId: string,
): Promise<AuthResponse> => {
  const apiResponse = await apiRequest(`/hobbies/${hobbyId}/users`, {
    method: 'GET',
  });
  return apiResponse;
};

/**
 * Remove hobbies from user
 * DELETE /hobbies/:hobbyId
 */
export const removeHobbyFromUser = async (
  hobbyId: string,
): Promise<AuthResponse> => {
  const apiResponse = await apiRequest(`/hobbies/${hobbyId}`, {
    method: 'DELETE',
    body: JSON.stringify({ hobbies: [hobbyId] }),
  });
  return apiResponse;
};
