module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: true,
    babelOptions: {
      configFile: './babel.config.js',
    },
  },
  root: true,
  extends: '@react-native',
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    // React Native app uses runtime-themed styles heavily; this rule creates
    // high-noise warnings with low signal for this codebase.
    'react-native/no-inline-styles': 'off',
  },
};
