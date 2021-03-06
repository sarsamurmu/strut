module.exports = {
  env: {
    es6: true,
    browser: true,
    mocha: true,
    commonjs: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: ['eslint:recommended'],
  rules: {
    'quotes': ['error', 'single', { avoidEscape: true }],
    'eqeqeq': 'error',
    'arrow-parens': ['error', 'always'],
    'no-var': 'error',
    'no-unneeded-ternary': 'error',
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }],
  },
  overrides: [
    {
      files: ['src/**/*.ts', 'test/**/*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
        'comma-spacing': 'off',
        '@typescript-eslint/comma-spacing': 'error',
        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': 'error',
        'quotes': 'off',
        '@typescript-eslint/quotes': ['error', 'single', { avoidEscape: true }],
        'require-await': 'off',
        '@typescript-eslint/require-await': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-for-in-array': 'error',
        'space-before-function-paren': 'off',
        '@typescript-eslint/space-before-function-paren': ['error', {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always'
        }]
      }
    }
  ]
}
