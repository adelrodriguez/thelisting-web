import clsx from "clsx"
import { useRef } from "react"

// import { useInView } from "framer-motion"
// import { useEffect, useRef } from "react"
import { Image } from "~/components/common"
import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import type { CoverImageProperties } from "~/utils/ribbons"

import SectionWrapper from "./SectionWrapper"
import useTheme from "./ThemeProvider"

export default function CoverImage({
  image,
  height,
}: // onView,
{ onView: (image: string) => void } & CoverImageProperties) {
  const ref = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  // const inView = useInView(ref)

  // useEffect(() => {
  //   if (inView) onView(image)
  // }, [inView, onView, image])

  return (
    <SectionWrapper className="min-h-screen sm:min-h-0">
      <div ref={ref}>
        <div className={clsx("relative block lg:hidden")}>
          <div style={{ height: height ? height : "100vh" }}>
            {image && (
              <Image
                alt=""
                className="h-full w-full border-y-8  object-cover object-center"
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
