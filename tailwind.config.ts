import HeadlessUIPlugin from "@headlessui/tailwindcss"
import AspectRatioPlugin from "@tailwindcss/aspect-ratio"
import FormsPlugin from "@tailwindcss/forms"
import TypographyPlugin from "@tailwindcss/typography"
import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  plugins: [
    AspectRatioPlugin,
    FormsPlugin,
    HeadlessUIPlugin({ prefix: "ui" }),
    TypographyPlugin,
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ["basic-sans", ...defaultTheme.fontFamily.sans],
        heading: ["linotype-didot", ...defaultTheme.fontFamily.serif],
        headline: ["linotype-didot-headline", ...defaultTheme.fontFamily.serif],
      },
    },
  },
} satisfies Config
