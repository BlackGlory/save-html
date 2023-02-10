module.exports = {
  root: true
, parser: '@typescript-eslint/parser'
, plugins: [
    '@typescript-eslint'
  ]
, extends: [
    'eslint:recommended'
  , 'plugin:@typescript-eslint/recommended'
  ]
, rules: {
    'no-useless-escape': 'off'
  , '@typescript-eslint/no-inferrable-types': 'off'
  , '@typescript-eslint/no-non-null-assertion': 'off'
  }
}
