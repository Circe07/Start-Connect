import { responseNormalizer } from '../../src/services/core/responseNormalizer';
import {
  configureGoogleSignIn,
  isSignedIn,
  signInWithGoogle,
  signOutFromGoogle,
} from '../../src/services/googleAuth';

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    isSignedIn: jest.fn(),
    signInSilently: jest.fn(),
  },
}));

const { GoogleSignin } = jest.requireMock('@react-native-google-signin/google-signin');

describe('responseNormalizer', () => {
  it('normalizes token and user from data payload', () => {
    const res = responseNormalizer({
      success: true,
      data: { accessToken: 'abc', user: { id: 'u1', email: 'a@a.com' } },
    });

    expect(res.success).toBe(true);
    expect(res.token).toBe('abc');
    expect(res.user?.id).toBe('u1');
  });

  it('passes through failed responses', () => {
    const failed = { success: false, error: 'bad request' };
    expect(responseNormalizer(failed)).toEqual(failed);
  });
});

describe('googleAuth service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('configures Google Sign-In', () => {
    configureGoogleSignIn();
    expect(GoogleSignin.configure).toHaveBeenCalled();
  });

  it('returns success user on sign-in success', async () => {
    GoogleSignin.hasPlayServices.mockResolvedValue(true);
    GoogleSignin.signIn.mockResolvedValue({
      user: { email: 'user@mail.com' },
      tokens: { idToken: 'id-token' },
    });

    const result = await signInWithGoogle();
    expect(result.success).toBe(true);
    expect(result.user.email).toBe('user@mail.com');
  });

  it('maps known Google sign-in errors', async () => {
    GoogleSignin.hasPlayServices.mockResolvedValue(true);
    GoogleSignin.signIn.mockRejectedValue({ code: 'SIGN_IN_CANCELLED' });
    const cancelled = await signInWithGoogle();
    expect(cancelled.success).toBe(false);
    expect(cancelled.error).toContain('cancelled');

    GoogleSignin.signIn.mockRejectedValue({ code: 'IN_PROGRESS' });
    const inProgress = await signInWithGoogle();
    expect(inProgress.success).toBe(false);
    expect(inProgress.error).toContain('in progress');
  });

  it('signs out successfully', async () => {
    GoogleSignin.signOut.mockResolvedValue(undefined);
    const result = await signOutFromGoogle();
    expect(result.success).toBe(true);
  });

  it('reads signed-in state and silent user', async () => {
    GoogleSignin.isSignedIn.mockResolvedValue(true);
    GoogleSignin.signInSilently.mockResolvedValue({
      user: { email: 'silent@mail.com' },
      tokens: { idToken: 'silent-token' },
    });
    const result = await isSignedIn();
    expect(result.success).toBe(true);
    expect(result.user.email).toBe('silent@mail.com');
  });
});
