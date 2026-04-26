import API_CONFIG from '../config/api';

// Token storage interface (we'll use a simple in-memory + AsyncStorage approach)
// For React Native, we can use AsyncStorage if available, otherwise fallback to memory

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: any;
  data?: any;
  error?: string;
  message?: string;
  status?: number;
  rawResponse?: any;
}

interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
  name?: string;
  first_surname?: string;
  // Add other fields as needed
}

interface LoginRequest {
  email: string;
  password: string;
}

// Simple token storage (in-memory for now, can be enhanced with AsyncStorage)
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  // TODO: Also store in AsyncStorage for persistence
  // import AsyncStorage from '@react-native-async-storage/async-storage';
  // if (token) {
  //   AsyncStorage.setItem('authToken', token);
  // } else {
  //   AsyncStorage.removeItem('authToken');
  // }
};

export const getAuthToken = (): string | null => {
  return authToken;
  // TODO: Also retrieve from AsyncStorage
  // import AsyncStorage from '@react-native-async-storage/async-storage';
  // return await AsyncStorage.getItem('authToken');
};

/**
 * Generic API request function
 */
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔐 Authorization header added (token length:', token.length, ')');
  } else {
    console.warn('⚠️ No token available - request will be unauthenticated');
  }

  try {
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    if (options.body) {
      console.log('📤 Request body:', JSON.parse(options.body as string));
    }

    const response = await fetch(url, {
      ...options,
      headers,
      timeout: API_CONFIG.TIMEOUT,
    } as any);

    // Get response as text first
    const responseText = await response.text();
    
    // Check response content type
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    
    console.log(`📥 Response status: ${response.status}`);
    console.log(`📥 Content-Type: ${contentType}`);
    console.log(`📥 Response length: ${responseText.length} characters`);
    console.log(`📥 Response preview (first 500 chars):`);
    console.log(responseText.substring(0, 500));

    let data: any;

    // Try to parse as JSON regardless of Content-Type (some servers don't set it correctly)
    // First check if it looks like JSON (starts with { or [)
    const trimmedText = responseText.trim();
    const looksLikeJson = trimmedText.startsWith('{') || trimmedText.startsWith('[');

    if (looksLikeJson) {
      try {
        data = JSON.parse(responseText);
        if (!isJson) {
          console.warn('⚠️ Warning: Server returned JSON but Content-Type is not application/json');
        }
      } catch (parseError: any) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('❌ Full response text:', responseText);
        
        // Determine what was actually returned
        let errorMessage = `Invalid JSON response from server. Status: ${response.status}. `;
        if (trimmedText.startsWith('<!DOCTYPE') || trimmedText.startsWith('<html')) {
          errorMessage += 'The server returned an HTML page instead of JSON. ';
          errorMessage += `This usually means the endpoint URL is incorrect or points to a web page.\n\n`;
          errorMessage += `Full URL called: ${url}\n`;
          errorMessage += `Check if this URL is correct and returns JSON data.`;
        } else if (trimmedText.length === 0) {
          errorMessage += 'The server returned an empty response.';
        } else {
          errorMessage += `Response preview: ${responseText.substring(0, 200)}`;
        }
        
        return {
          success: false,
          error: errorMessage,
          status: response.status,
          rawResponse: responseText.substring(0, 1000),
        };
      }
    } else {
      // Doesn't look like JSON
      console.error('❌ Non-JSON response received');
      
      let errorMessage = `Server returned non-JSON response. Status: ${response.status}. `;
      
      if (trimmedText.startsWith('<!DOCTYPE') || trimmedText.startsWith('<html')) {
        errorMessage += 'The server returned an HTML page instead of JSON.\n\n';
        errorMessage += `Full URL called: ${url}\n\n`;
        errorMessage += `Possible issues:\n`;
        errorMessage += `1. Wrong API endpoint URL (check BASE_URL in src/config/api.ts)\n`;
        errorMessage += `2. Endpoint path is incorrect\n`;
        errorMessage += `3. Server is returning a web page instead of API response\n\n`;
        errorMessage += `Please verify that ${url} returns JSON data, not an HTML page.`;
      } else if (trimmedText.length === 0) {
        errorMessage += 'The server returned an empty response.';
      } else {
        errorMessage += `Response type: ${contentType || 'unknown'}\n`;
        errorMessage += `Response preview: ${responseText.substring(0, 200)}`;
      }
      
      return {
        success: false,
        error: errorMessage,
        status: response.status,
        rawResponse: responseText.substring(0, 1000),
        url: url, // Include the full URL in the error
      };
    }

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status}`, data);
      return {
        success: false,
        error: data.message || data.error || `Request failed with status ${response.status}`,
        status: response.status,
      };
    }

    console.log('✅ API Response:', data);
    return {
      success: true,
      ...data,
    };
  } catch (error: any) {
    console.error('💥 API Request Error:', error);
    
    // Check if it's a JSON parse error
    if (error.message && error.message.includes('JSON')) {
      return {
        success: false,
        error: 'Failed to parse server response. The server may be returning an error page instead of JSON. Please check the API endpoint URL.',
      };
    }
    
    return {
      success: false,
      error: error.message || 'Network error. Please check your connection and try again.',
    };
  }
};

/**
 * Register a new user
 * POST /auth/register
 */
export const registerUser = async (
  userData: RegisterRequest
): Promise<AuthResponse> => {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  if (response.success && response.token) {
    setAuthToken(response.token);
  }

  return response;
};

/**
 * Login user
 * POST /auth/login
 */
export const loginUser = async (
  credentials: LoginRequest
): Promise<AuthResponse> => {
  console.log('🔐 Starting login request...');
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  console.log('📦 Login API response received:', {
    success: response.success,
    hasToken: !!(response.token || response.data?.token || response.accessToken),
    hasUser: !!(response.user || response.data?.user),
    responseKeys: Object.keys(response),
  });

  // Extract token from multiple possible locations
  let token: string | null = null;
  
  if (response.success) {
    // Check various possible token locations
    if (response.token) {
      token = response.token;
      console.log('✅ Token found in response.token');
    } else if (response.data?.token) {
      token = response.data.token;
      console.log('✅ Token found in response.data.token');
    } else if (response.accessToken) {
      token = response.accessToken;
      console.log('✅ Token found in response.accessToken');
    } else if (response.data?.accessToken) {
      token = response.data.accessToken;
      console.log('✅ Token found in response.data.accessToken');
    } else {
      console.warn('⚠️ No token found in login response!');
      console.warn('⚠️ Response structure:', JSON.stringify(response, null, 2));
    }
    
    // Store token if found
    if (token) {
      console.log('🔑 Storing authentication token (length:', token.length, ')');
      setAuthToken(token);
      console.log('✅ Token stored successfully');
    } else {
      console.error('❌ Cannot store token - token not found in response');
    }
  } else {
    console.error('❌ Login failed:', response.error);
  }

  return response;
};

/**
 * Logout user
 * POST /auth/logout
 */
export const logoutUser = async (): Promise<{ success: boolean; error?: string }> => {
  const response = await apiRequest('/auth/logout', {
    method: 'POST',
  });

  if (response.success) {
    setAuthToken(null);
  }

  return response;
};

/**
 * Get current user profile
 * 
 * This function retrieves the current authenticated user's profile information.
 * It tries multiple endpoints in order of preference:
 * 
 * 1. GET /users/me - Primary endpoint (usually has complete profile data)
 * 2. GET /auth/me - Fallback endpoint (basic user info)
 * 
 * The function handles various response formats:
 * - { success: true, user: {...} }
 * - { success: true, data: { user: {...} } }
 * - { success: true, data: {...} } (data is the user object)
 * - Direct user object in response
 * 
 * @returns Promise<AuthResponse> with user data in response.user field
 */
export const getCurrentUser = async (): Promise<AuthResponse> => {
  console.log('🔍 Fetching user profile...');
  const token = getAuthToken();
  
  if (!token) {
    console.error('❌ No auth token available for /auth/me request');
    return {
      success: false,
      error: 'No authentication token available. Please login again.',
    };
  }
  
  console.log('🔑 Token available, length:', token.length);
  
  // Try /users/me first (might have more complete profile data)
  // Then fallback to /auth/me if needed
  console.log('📡 Trying GET /users/me first...');
  let response = await apiRequest('/users/me', {
    method: 'GET',
  });
  
  // If /users/me fails or returns minimal data, try /auth/me
  if (!response.success || (!response.user && (!response.data || Object.keys(response.data || {}).length <= 2))) {
    console.log(`⚠️ /users/me ${!response.success ? 'failed' : 'returned minimal data'} (status: ${response.status}), trying /auth/me...`);
    const authMeResponse = await apiRequest('/auth/me', {
      method: 'GET',
    });
    
    // Use /auth/me response if it's better (has more data or /users/me failed)
    if (authMeResponse.success && (!response.success || (authMeResponse.user && !response.user))) {
      console.log('✅ Using /auth/me response (better data or /users/me failed)');
      response = authMeResponse;
    } else if (response.success && authMeResponse.success) {
      // Both succeeded - prefer the one with more user data
      const usersMeHasUser = !!(response.user || (response.data && Object.keys(response.data).length > 2));
      const authMeHasUser = !!(authMeResponse.user || (authMeResponse.data && Object.keys(authMeResponse.data).length > 2));
      
      if (authMeHasUser && !usersMeHasUser) {
        console.log('✅ Using /auth/me response (has user data)');
        response = authMeResponse;
      } else {
        console.log('✅ Using /users/me response (has user data)');
      }
    }
  }
  
  // Normalize the response - handle different response structures
  if (response.success) {
    console.log('✅ User profile fetch successful');
    console.log('📦 Full response structure:', JSON.stringify(response, null, 2));
    
    // Extract user data from various possible response formats
    let userData = null;
    
    // Try multiple possible locations for user data
    if (response.user) {
      userData = response.user;
      console.log('✅ User data found in response.user');
    } else if (response.data?.user) {
      userData = response.data.user;
      console.log('✅ User data found in response.data.user');
    } else if (response.data && (response.data.id || response.data.email || response.data.username || response.data.name)) {
      // response.data itself might be the user object
      userData = response.data;
      console.log('✅ User data found in response.data (direct user object)');
    } else {
      // Check if response itself is the user object (without wrapper)
      const hasUserFields = response.id || response.email || response.username || response.name || response.uid;
      if (hasUserFields && !response.success) {
        // If it has user fields but no success flag, it might be the user directly
        userData = response;
        console.log('✅ User data found directly in response (no wrapper)');
      } else if (hasUserFields) {
        // Response has user fields but also has success flag - extract user fields
        const { success, error, message, status, ...rest } = response;
        if (Object.keys(rest).length > 0) {
          userData = rest;
          console.log('✅ User data extracted from response (removed metadata)');
        }
      }
    }
    
    if (userData) {
      console.log('✅ User data extracted successfully:', {
        id: userData.id || userData.uid,
        email: userData.email,
        username: userData.username,
        name: userData.name,
        keys: Object.keys(userData),
      });
      return {
        success: true,
        user: userData,
      };
    } else {
      console.error('❌ User data not found in response structure');
      console.error('❌ Available response keys:', Object.keys(response));
      console.error('❌ Full response:', JSON.stringify(response, null, 2));
      return {
        success: false,
        error: 'User data not found in API response. Please check API response format.',
        rawResponse: response,
      };
    }
  } else {
    console.error('❌ User profile fetch failed');
    console.error('❌ Error message:', response.error);
    console.error('❌ Response status:', response.status);
    console.error('❌ Full error response:', JSON.stringify(response, null, 2));
    
    // Return detailed error information
    return {
      success: false,
      error: response.error || `Failed to fetch user profile (Status: ${response.status || 'unknown'})`,
      status: response.status,
      rawResponse: response,
    };
  }
  
  return response;
};

/**
 * Change password
 * POST /auth/change-password
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  return apiRequest('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });
};

/**
 * Get user profile by ID
 * GET /users/:uid
 */
export const getUserById = async (userId: string): Promise<AuthResponse> => {
  return apiRequest(`/users/${userId}`, {
    method: 'GET',
  });
};

/**
 * Update current user profile
 * PATCH /users/me
 */
export const updateCurrentUser = async (
  userData: Partial<any>
): Promise<AuthResponse> => {
  return apiRequest('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  changePassword,
  getUserById,
  updateCurrentUser,
  setAuthToken,
  getAuthToken,
};
