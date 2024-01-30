/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  overrides: [
    {
      extends: ["plugin:@typescript-eslint/recommended"],
      files: ["./**/*.{ts,tsx}"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
      plugins: ["@typescript-eslint"],
      rules: {
        "@typescript-eslint/ban-ts-comment": "error",
        "@typescript-eslint/ban-types": "error",
        "@typescript-eslint/no-empty-function": "error",
        "@typescript-eslint/no-empty-interface": "error",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-inferrable-types": "error",
        "@typescript-eslint/no-namespace": "error",
        "@typescript-eslint/no-non-null-assertion": "error",
        "@typescript-eslint/no-unnecessary-condition": "warn",
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-use-before-define": [
          "error",
          { classes: false, functions: false },
        ],
        "@typescript-eslint/no-var-requires": "error",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  plugins: ["sort-keys-fix", "sort-destructure-keys"],
  root: true,
  rules: {
    "no-console": "warn",
    "no-unused-vars": "off",
    "react/jsx-sort-props": "error",
    "react/react-in-jsx-scope": "off",
    "sort-destructure-keys/sort-destructure-keys": "warn",
    "sort-keys-fix/sort-keys-fix": "warn",
    "sort-vars": "warn",
    "spaced-comment": [
      "error",
      "always",
      {
        line: {
          markers: ["/"],
        },
      },
    ],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
}
