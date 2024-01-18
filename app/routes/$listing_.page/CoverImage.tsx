import clsx from "clsx"
import { useRef } from "react"

// import { useInView } from "framer-motion"
// import { useEffect, useRef } from "react"
import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import type { CoverImageProperties } from "~/utils/ribbons"

import SectionWrapper from "./SectionWrapper"
import useTheme from "./ThemeProvider"

export default function CoverImage({
  height,
  image,
}: { onView: (image: string) => void } & CoverImageProperties) {
  const ref = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  return (
    <SectionWrapper className="sm:hidden">
      <div ref={ref}>
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
      </div>
    </SectionWrapper>
  )
}
