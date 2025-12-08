module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: true,
    babelOptions: {
      configFile: './frontend/babel.config.js',
    },
  },
  root: true,
  extends: '@react-native',
};
