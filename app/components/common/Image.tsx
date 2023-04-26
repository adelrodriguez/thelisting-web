import type { ComponentPropsWithoutRef } from "react"
import type { ResponsiveSize } from "remix-image"
import RemixImage from "remix-image"

export default function Image({
  alt,
  className,
  src,
  responsive,
  style,
}: {
  responsive?: ResponsiveSize[]
} & ComponentPropsWithoutRef<"img">) {
  return (
    <RemixImage
      className={className}
      loaderUrl="/api/image"
      src={src}
      alt={alt}
      responsive={responsive}
      dprVariants={[1, 3]}
      placeholder="blur"
      style={style}
    />
  )
}
