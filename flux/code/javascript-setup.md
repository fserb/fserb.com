---
layout: page
title: my javascript setup
date: 2023-05-21 16:50
---

Contrary to a lot of "hardcore" programmers out there, I enjoy coding in Javascript quite a lot. Here are some things I do with my setup to make things much nicer.

The gist of it is that I use `eslint` and `tsc` as a compilation layer, where `tsc`
does type checking (with mostly no annotation) and `eslint` prevents most types of oversights. Together, they cover 90% of the issues I'd normally rely on the compiler of a regular language to figure out.

# eslint

[eslint](https://eslint.org/) does statical analyzes in js. I have a global `.eslintrc.js` that is:

```js
"use strict";

module.exports = {
  extends: "eslint:recommended",
  root: true,
  rules: {
    "array-bracket-spacing": ["error", "never"],
    "arrow-parens": ["error", "as-needed"],
    "camelcase": ["error"],
    "comma-spacing": ["error"],
    "comma-style": ["error"],
    "curly": ["error", "multi-line"],
    "guard-for-in": ["error"],
    "indent": ["error", 2],
    'func-call-spacing': 'error',
    "linebreak-style": ["error", "unix"],
    "max-len": ["error", { "code": 90, "tabWidth": 2 }],
    "no-multiple-empty-lines": ["error", {max: 1}],
    "no-tabs": ["error"],
    "keyword-spacing": "error",
    "key-spacing": ["error", {"beforeColon": false, "afterColon": true}],
    "no-with": ["error"],
    "new-cap": ["error", {"capIsNew": false}],
    'no-array-constructor': 'error',
    "no-caller": ["error"],
    "no-multi-spaces": ["error", { ignoreEOLComments: true }],
    "no-multi-str": ["error"],
    "no-invalid-this": ["error"],
    "no-trailing-spaces": ["error"],
    "no-new-wrappers": ["error"],
    "no-new-symbol": ["error"],
    "no-irregular-whitespace": ["error"],
    "no-unneeded-ternary": ["error", { "defaultAssignment": false }],
    "no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_",
    }],
    "no-unused-expressions": ["error"],
    "prefer-promise-reject-errors": ["error"],
    "prefer-spread": ["error"],
    "rest-spread-spacing": ["error"],
    "prefer-rest-params": ["error"],
    "no-unexpected-multiline": ["error"],
    "no-unsafe-optional-chaining": "error",
    "no-use-before-define": ["error"],
    "no-constant-condition": ["error", { "checkLoops": false }],
    "no-constructor-return": ["error"],
    "no-implied-eval": ["error"],
    "no-throw-literal": ["error"],
    "no-var": ["error"],
    "no-shadow": ["error"],
    "padded-blocks": ["error", "never"],
    "prefer-const": ["error", { "destructuring": "all"}],
    "semi": ["error", "always"],
    "semi-spacing": ["error"],
    "require-await": ["error"],
    "space-before-blocks": ["error", "always"],
    "space-before-function-paren": ["error", {
      "anonymous": "never",
      "named": "never",
      "asyncArrow": "always",
    }],
    "space-in-parens": ["error", "never"],
    "space-infix-ops": ["error", {"int32Hint": true}],
  },
  ignorePatterns: [],
  env: {
    browser: true,
    es6: true
  },
  globals: {
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  }
};

```

# tsc


# git pre-commit hook

