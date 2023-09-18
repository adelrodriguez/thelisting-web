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
      alt={alt}
      className={className}
      dprVariants={[1, 3]}
      loaderUrl="/api/image"
      placeholder="blur"
      responsive={responsive}
      src={src}
      style={style}
    />
  )
}
