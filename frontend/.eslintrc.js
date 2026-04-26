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
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
