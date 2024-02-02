import type { CoverImageProperties } from "~/utils/ribbons"

import useTheme from "./ThemeProvider"

export default function CoverImage({ image }: CoverImageProperties) {
  const { theme } = useTheme()

  return (
    <div className="relative block h-full w-full md:h-0">
      <div className="h-full md:hidden">
        {image && (
          <img
            alt=""
            className="h-full w-full border-y-8 object-cover object-center"
            loading="lazy"
            src={image}
            style={{ borderColor: theme.colors?.secondary }}
          />
        )}
      </div>
    </div>
  )
}
