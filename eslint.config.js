import nyxb from '@nyxb/eslint-config'

export default nyxb({
   rules: {
      'node/prefer-global/process': 0,
      'style/max-statements-per-line': 0,
      'no-useless-catch': 0,
      'no-case-declarations': 0,
      'unicorn/prefer-number-properties': 0,
      'no-prototype-builtins': 0,
      'jsdoc/require-returns-description': 0,
      'no-console': 0,
      'unused-imports/no-unused-vars-ts': 0,
      'unused-imports/no-unused-vars': 0,
      'ts/no-var-requires': 0,
      'ts/no-require-imports': 0,
      'nyxb/top-level-function': 0,
   },
})
