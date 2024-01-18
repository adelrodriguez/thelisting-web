import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import type { ImageGalleryProperties } from "~/utils/ribbons"

import SectionWrapper from "./SectionWrapper"

export default function ImageGallery({
  groupSize,
  images,
}: ImageGalleryProperties) {
  const groupedImages = images.reduce((acc: string[][], image, index) => {
    if (index % groupSize === 0) {
      acc.push([])
    }

    acc[acc.length - 1]!.push(image)

    return acc
  }, [])

  return (
    <SectionWrapper>
      <div className="px-4 py-20">
        <div className="grid grid-cols-2 gap-2">
          {groupedImages.map((images, index) => (
            <div className="flex flex-col gap-2" key={`group${index}`}>
              {images.map((image, index) => (
                <div key={`image${index}`}>
                  <img
                    alt=""
                    className="h-auto max-w-full rounded-md shadow-inner"
                    src={generateCloudflareImageUrl(image, "public")}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
