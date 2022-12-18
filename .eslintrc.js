/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "prettier",
  ],
  plugins: ["sort-keys"],
  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "no-unused-vars": "off",
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
