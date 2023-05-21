---
layout: page
title: my javascript setup
date: 2023-05-21 16:50
---

Contrary to a lot of "hardcore" programmers out there, I enjoy coding in Javascript quite a lot. Here are some things I do with my setup to make things nicer.

The gist of it is that I use `eslint` and `tsc` as a compilation layer, where `tsc`
does type checking (with mostly no annotation) and `eslint` prevents a lot of anti-patterns and some oversights. Together, they cover 90% of the issues I'd normally rely on the compiler of a regular language to figure out.

I end up with a language that is fun to use (I'd argue that `async/await` is the best language feature to come up in the last decade), and with most of the protections needed to not shoot myself in the foot.


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

It's a mix of my own Javascript style (2 spaces tabWidth, 90 max width), with some
basic protections for mistakes and some hard rules about spaces that I'm so used to that I can't really code without.

I haven't updated them in a long time, but I also haven't followed up to see what's new on `eslint` plugin land, so maybe there are new things that I'd try to enforce here.


# tsc

I also use [tsc](https://www.typescriptlang.org/), the TypeScript compiler, to go
through the code, do its best at infering types, and complaining if anything weird is going on.

Usually I don't add inline definitions and I limit definition files (`d.ts`) for generic libraries that I carry around.

The `jsconfig.json` for it is pretty generic:

```js
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "moduleResolution": "nodenext",
    "checkJs": true,
    "types": [
      "offscreencanvas", // not sure if still needed
    ]
  },
  "exclude": [
    "node_modules",
  ],
  "include": [
    "src",
  ]
```

I don't want `tsc` to complaint about modern Javascript, so I keep it to `esnext`. I have another workflow to increase compatibility (usually using rollup/babel). Either way, I don't want `tsc` to care about it much.


# Running it

Both tools are integrated in my editor, so they show inline errors as I type. But I still keep a way to run this on the command line:

```sh
eslint src/
tsc --resolveJsonModule --noImplicitReturns --noEmit -p jsconfig.json
```

# git pre-commit hook

On top of that, I make sure that I never commit any code that is not clear. To help with that, I have a simple pre-commit git hook that enforces that the code passes.

This is `.git/hooks/pre-commit`:

```sh
#!/bin/sh
set -euo pipefail

FILES="$(git diff --cached --name-only --diff-filter=ACM | egrep '\.js.?$')"
ESLINT="$(git rev-parse --show-toplevel)/node_modules/.bin/eslint"

if [[ "$FILES" = "" ]]; then
  exit 0
fi

printf "\033[32meslint\033[0m\n"
eslint --color $(echo $FILES | tr '\n' ' ')

printf "\033[32mtslint\033[0m\n"
tsc --resolveJsonModule --noImplicitReturns --noEmit -p jsconfig.json
```

This will run during `git commit` and stop the commit if the current edited files are not in order. To bypass the hook, use `git commit --no-verify`.
