/* eslint-env jest */

import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    NavigationContainer: ({ children }) => children,
  };
});

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => {
    const React = require('react');
    const { View } = require('react-native');

    return {
      Navigator: ({ children }) => React.createElement(View, null, children),
      Screen: ({ children }) => React.createElement(View, null, children),
    };
  },
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({
      user: { id: 'test', email: 'test@example.com', name: 'Test User' },
      idToken: 'mock-id-token',
    }),
    signOut: jest.fn().mockResolvedValue(undefined),
    getCurrentUser: jest.fn().mockReturnValue(null),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

const mockAuthInstance = {
  currentUser: null,
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
};

const mockFirestoreCollection = {
  doc: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
  where: jest.fn(() => mockFirestoreCollection),
  orderBy: jest.fn(() => mockFirestoreCollection),
  limit: jest.fn(() => mockFirestoreCollection),
  get: jest.fn(),
};

jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: () => ({}),
}));

jest.mock('@react-native-firebase/auth', () => {
  const authFn = () => mockAuthInstance;
  return {
    __esModule: true,
    default: authFn,
    getAuth: jest.fn(() => mockAuthInstance),
  };
});

jest.mock('@react-native-firebase/firestore', () => {
  const firestoreFn = () => ({
    collection: jest.fn(() => mockFirestoreCollection),
  });
  return {
    __esModule: true,
    default: firestoreFn,
    getFirestore: jest.fn(() => ({
      collection: jest.fn(() => mockFirestoreCollection),
    })),
  };
});

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }) => React.createElement(View, null, children),
    Marker: ({ children }) => React.createElement(View, null, children),
    Callout: ({ children }) => React.createElement(View, null, children),
  };
});
