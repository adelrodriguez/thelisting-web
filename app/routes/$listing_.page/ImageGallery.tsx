import type { ImageGalleryProperties } from "~/utils/ribbons"

export default function ImageGallery({
  groupSize,
  images,
}: ImageGalleryProperties) {
  const groupedImages = images.reduce((acc: string[][], image, index) => {
    if (index % groupSize === 0) {
      acc.push([])
    }

    const arr = acc[acc.length - 1]

    if (!arr) {
      return acc
    }

    arr.push(image)

    return acc
  }, [])

  if (images.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 gap-2 px-4 lg:px-6">
      {groupedImages.map((images, index) => (
        <div className="flex flex-col gap-2" key={`group${index}`}>
          {images.map((image, index) => (
            <div key={`image${index}`}>
              <img
                alt=""
                className="h-auto max-w-full rounded-md shadow-inner"
                src={image}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
