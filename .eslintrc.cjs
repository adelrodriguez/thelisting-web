/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
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
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-unused-vars": "warn",
      },
    },
  ],
  plugins: ["sort-keys"],
  root: true,
  rules: {
    "no-console": "warn",
    "no-unused-vars": "off",
    "react/jsx-sort-props": "error",
    "sort-keys/sort-keys-fix": "warn",
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
}
