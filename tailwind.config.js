/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme")

module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  plugins: [
    require("@headlessui/tailwindcss")({ prefix: "ui" }),
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ["basic-sans", ...defaultTheme.fontFamily.sans],
        header: ["linotype-didot", ...defaultTheme.fontFamily.serif],
        headline: ["linotype-didot-headline", ...defaultTheme.fontFamily.serif],
      },
    },
  },
}
