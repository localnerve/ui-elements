const js = require('@eslint/js');
const globals = require('globals');
const n = require('eslint-plugin-n');

const nodeRules = n['flat/recommended-script'];

module.exports = [{
  ignores: [
    'node_modules/**',
    '**/dist/**',
    '**/tmp/**',
    '**/bundle.js',
    '**/*.config.js'
  ]
}, {
  name: 'source',
  files: [
    'src/**'
  ],
  ...js.configs.recommended,
  rules: {
    ...js.configs.recommended.rules,
    'function-paren-newline': ['error', 'consistent'],
    'space-before-function-paren': ['error', 'always'],
    'no-plusplus': 0,
    'comma-dangle': 0,
    'arrow-parens': 0,
    'max-classes-per-file': 0,
    'prefer-object-spread': ['warn']
  },
  languageOptions: {
    globals: {
      ...globals.browser
    }
  }
}, {
  name: 'node general',
  files: [
    'test/**',
    'src/horizontal-pager/test/functional-tests.js',
    'src/utils/{dirs,local-server}.js'
  ],
  plugins: {
    n
  },
  languageOptions: {
    globals: {
      ...globals.node
    }
  },
  rules: {
    ...js.configs.recommended.rules,
    ...nodeRules
  }
}, {
  name: 'test-playwright',
  files: [
    'test/horizontal-pager/*.test.js',
    'test/jump-scroll/*.test.js'
  ],
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.browser,
    }
  }
}, {
  name: 'test-browser',
  files: [
    'test/helpers/browser.js',
    'src/horizontal-pager/test/browser-tests/**'
  ],
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.mocha
    }
  }
}];