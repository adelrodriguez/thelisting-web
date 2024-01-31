import { EmbeddedProperties } from "~/utils/ribbons/embedded"

import useTheme from "./ThemeProvider"

export default function Embedded({ height, title, url }: EmbeddedProperties) {
  const { theme } = useTheme()

  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-2 px-4 md:px-6">
      {title && (
        <h3
          className="pb-4 text-center text-2xl font-semibold tracking-wide md:text-3xl"
          style={{ fontFamily: theme.fonts?.heading }}
        >
          {title}
        </h3>
      )}
      <iframe
        className="w-full"
        loading="lazy"
        src={url}
        style={{ height }}
        title={title}
      />
    </div>
  )
}
