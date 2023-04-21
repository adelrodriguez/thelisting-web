import clsx from "clsx"
import { useInView } from "framer-motion"
import { useEffect, useRef } from "react"

import { Image } from "~/components/common"
import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import type { CoverImageProperties } from "~/utils/ribbons"

import useTheme from "./ThemeProvider"

export default function CoverImage({
  image,
  height,
  onView,
}: { onView: (image: string) => void } & CoverImageProperties) {
  const ref = useRef<HTMLDivElement>(null)
  const [styles] = useTheme()
  const inView = useInView(ref)

  useEffect(() => {
    if (inView) onView(image)
  }, [inView, onView, image])

  return (
    <section>
      <div ref={ref} style={styles}>
        <div className={clsx("relative block lg:hidden")}>
          <div style={{ height: height ? height : "100vh" }}>
            {image && (
              <Image
                className="h-full w-full border-y-8 border-white object-cover object-center"
                src={generateCloudflareImageUrl(image, "display")}
                alt=""
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
