module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2020, sourceType: 'module', project: './tsconfig.json' },
  plugins: ['react','@typescript-eslint','import','react-hooks'],
  extends: ['eslint:recommended','plugin:react/recommended','plugin:@typescript-eslint/recommended','prettier'],
  settings: { react: { version: 'detect' } },
  env: { browser: true, node: true, es2021: true },
  rules: { 'react/react-in-jsx-scope': 'off' }
};
