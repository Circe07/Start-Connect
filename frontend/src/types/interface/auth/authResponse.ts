export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: any;
  data?: any;
  error?: string;
  message?: string;
  status?: number;
  rawResponse?: any;
}
