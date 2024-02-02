import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import Autoplay from "embla-carousel-autoplay"
import useEmblaCarousel from "embla-carousel-react"
import { useState } from "react"

import { ONE_SECOND } from "~/config/consts"
import type { ImageCarouselProperties } from "~/utils/ribbons"

export default function ImageCarousel({
  duration,
  height,
  images,
}: ImageCarouselProperties) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: duration * ONE_SECOND.inMilliseconds }),
  ])

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      ref={emblaRef}
      style={{ height }}
    >
      <div className="flex h-full">
        {images.map((image) => (
          <div className="min-w-0 shrink-0 grow-0 basis-full" key={image}>
            <img
              alt=""
              className="absolute h-full w-full rounded-md object-cover"
              src={image}
            />
          </div>
        ))}
      </div>

      <button
        className="absolute bottom-1/2 left-0 z-10 translate-y-1/2 p-2 text-white focus:outline-none"
        onClick={() => {
          emblaApi?.scrollNext()
          setSelectedIndex(emblaApi?.selectedScrollSnap() || 0)
        }}
      >
        <ChevronLeftIcon className="h-12 w-12" />
      </button>
      <button
        className="absolute bottom-1/2 right-0 z-10 translate-y-1/2 p-2 text-white focus:outline-none"
        onClick={() => {
          emblaApi?.scrollNext()
          setSelectedIndex(emblaApi?.selectedScrollSnap() || 0)
        }}
      >
        <ChevronRightIcon className="h-12 w-12" />
      </button>
      <div className="absolute bottom-0 flex w-full justify-center space-x-2 p-2">
        {images.map((_, index) => (
          <span
            className={clsx(
              "inline-block h-2 w-2 cursor-pointer rounded-full",
              selectedIndex === index ? "bg-white" : "bg-slate-700 opacity-50",
            )}
            key={index}
            onClick={() => {
              emblaApi?.scrollTo(index)
              setSelectedIndex(emblaApi?.selectedScrollSnap() || 0)
            }}
          />
        ))}
      </div>
    </div>
  )
}
