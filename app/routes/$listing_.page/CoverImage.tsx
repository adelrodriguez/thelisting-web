import clsx from "clsx"

import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import type { CoverImageProperties } from "~/utils/ribbons"

import useTheme from "./ThemeProvider"

export default function CoverImage({ height, image }: CoverImageProperties) {
  const { theme } = useTheme()

  return (
    <div className={clsx("relative block lg:hidden")}>
      <div style={{ height: height ? height : "100vh" }}>
        {image && (
          <img
            alt=""
            className="h-full w-full border-y-8  object-cover object-center"
            loading="lazy"
            src={generateCloudflareImageUrl(image, "display")}
            style={{ borderColor: theme.colors?.secondary }}
          />
        )}
      </div>
    </div>
  )
}
