/* eslint-env jest */

import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  NavigationContainer: ({ children }) => children,
}));

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

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: () => ({}),
}));

jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  getAuth: jest.fn(() => ({ currentUser: null })),
  default: () => ({
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  }),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  getFirestore: jest.fn(() => ({})),
  default: () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
      })),
      where: jest.fn(),
      get: jest.fn(),
    })),
  }),
}));

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
