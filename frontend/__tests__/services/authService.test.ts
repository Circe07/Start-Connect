import {
  changePassword,
  loginUser,
  logoutUser,
  registerUser,
} from '../../src/services/auth/authService';
import {
  getAuthToken,
  setAuthToken,
} from '../../src/services/storage/authStorage';

jest.mock('../../src/services/core/apiClient', () => ({
  apiRequest: jest.fn(),
}));

const { apiRequest } = jest.requireMock('../../src/services/core/apiClient');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setAuthToken(null);
  });

  it('registerUser stores token when API returns success', async () => {
    apiRequest.mockResolvedValue({
      success: true,
      data: { token: 'register-token', user: { id: 'u1' } },
    });

    const res = await registerUser({
      email: 'a@a.com',
      password: 'Pass123!',
      name: 'A',
      username: 'aa',
    });

    expect(apiRequest).toHaveBeenCalledWith('/auth/register', expect.any(Object));
    expect(res.success).toBe(true);
    expect(getAuthToken()).toBe('register-token');
  });

  it('loginUser stores token when API returns success', async () => {
    apiRequest.mockResolvedValue({
      success: true,
      data: { token: 'login-token', user: { id: 'u2' } },
    });

    const res = await loginUser({ email: 'a@a.com', password: 'Pass123!' });

    expect(apiRequest).toHaveBeenCalledWith('/auth/login', expect.any(Object));
    expect(res.success).toBe(true);
    expect(getAuthToken()).toBe('login-token');
  });

  it('logoutUser clears token on success', async () => {
    setAuthToken('existing-token');
    apiRequest.mockResolvedValue({ success: true });

    const res = await logoutUser();

    expect(apiRequest).toHaveBeenCalledWith('/auth/logout', { method: 'POST' });
    expect(res.success).toBe(true);
    expect(getAuthToken()).toBeNull();
  });

  it('changePassword forwards email payload', async () => {
    apiRequest.mockResolvedValue({ success: true });

    await changePassword('user@mail.com');

    expect(apiRequest).toHaveBeenCalledWith('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@mail.com' }),
    });
  });
});
