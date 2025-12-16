import { AuthResponse } from '@/types/interface/auth/authResponse';

export const responseNormalizer = (apiResponse: any): AuthResponse => {
  if (!apiResponse.success) {
    return apiResponse;
  }

  const data = apiResponse.data || {};

  let token =
    data.token ||
    data.accessToken ||
    apiResponse.token ||
    apiResponse.accessToken ||
    null;

  let user = data.user || data;

  if (!user || (!user.id && !user.email)) {
    const { success, error, status, rawResponse, ...rest } = apiResponse;
    if (rest.id || rest.email || rest.username) {
      user = rest;
    } else {
      user = null;
    }
  }

  return {
    success: true,
    user: user,
    token: token,
    error: apiResponse.error,
  };
};
