import type { ResponsiveSize } from "remix-image"
import RemixImage from "remix-image"

export default function Image({
  alt,
  className,
  src,
  responsive,
}: {
  alt: string
  className: string
  src: string
  responsive?: ResponsiveSize[]
}) {
  return (
    <RemixImage
      className={className}
      loaderUrl="/api/image"
      src={src}
      alt={alt}
      responsive={responsive}
      dprVariants={[1, 3]}
      placeholder="blur"
    />
  )
}
