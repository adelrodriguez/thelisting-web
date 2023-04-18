import clsx from "clsx"
import { useInView } from "framer-motion"
import { useEffect, useRef } from "react"

import { Image } from "~/components/common"
import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import type { CoverImageProperties } from "~/utils/ribbons"

export default function CoverImage({
  image,
  height,
  onView,
}: { onView: (image: string) => void } & CoverImageProperties) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)

  useEffect(() => {
    if (inView) onView(image)
  }, [inView, onView, image])

  return (
    <section ref={ref}>
      <div
        className={clsx(
          "relative block bg-gray-800 lg:hidden",
          height || "h-screen"
        )}
      >
        {image && (
          <Image
            className="h-full w-full object-cover object-center"
            src={generateCloudflareImageUrl(image, "display")}
            alt=""
          />
        )}
      </div>
    </section>
  )
}
