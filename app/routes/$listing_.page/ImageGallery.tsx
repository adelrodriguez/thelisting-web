import { Image } from "~/components/common"
import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import type { ImageGalleryProperties } from "~/utils/ribbons"

export default function ImageGallery({
  images,
  groupSize,
}: ImageGalleryProperties) {
  const groupedImages = images.reduce((acc: string[][], image, index) => {
    if (index % groupSize === 0) {
      acc.push([])
    }

    acc[acc.length - 1]!.push(image)

    return acc
  }, [])

  return (
    <section>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2">
          {groupedImages.map((images, index) => (
            <div key={`group${index}`} className="flex flex-col gap-2">
              {images.map((image, index) => (
                <div key={`image${index}`}>
                  <Image
                    className="h-auto max-w-full rounded-md"
                    src={generateCloudflareImageUrl(image, "public")}
                    alt=""
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
