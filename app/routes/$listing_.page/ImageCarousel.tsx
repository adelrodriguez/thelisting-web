import { Transition } from "@headlessui/react"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import { useEffect, useRef, useState } from "react"

import type { ImageCarouselProperties } from "~/utils/ribbons"

export default function ImageCarousel({
  duration,
  height,
  images,
}: ImageCarouselProperties) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselInterval = useRef<NodeJS.Timeout>()

  useEffect(() => {
    carouselInterval.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, duration * 1000)

    return () => {
      clearInterval(carouselInterval.current)
    }
  }, [images, duration])

  function navigate(direction: "prev" | "next") {
    setCurrentIndex((prevIndex) => {
      if (direction === "prev") {
        return prevIndex === 0 ? images.length - 1 : prevIndex - 1
      }

      if (direction === "next") {
        return (prevIndex + 1) % images.length
      }

      return 0
    })
    clearInterval(carouselInterval.current)
  }

  return (
    <div
      className={clsx("relative w-full overflow-hidden", {
        "h-screen": !height,
      })}
      style={{ height: height || undefined }}
    >
      {images.map((image, index) => (
        <Transition
          enter="transition-opacity duration-1000"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          key={index}
          leave="transition-opacity duration-1000"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          show={currentIndex === index}
        >
          <img
            alt=""
            className="absolute h-full w-full rounded-md object-cover"
            src={image}
          />
        </Transition>
      ))}
      <button
        className="absolute bottom-1/2 left-0 z-10 rounded-r-lg bg-slate-700 bg-opacity-50 p-2 text-white focus:outline-none"
        onClick={() => navigate("prev")}
      >
        <ChevronLeftIcon className="h-6 w-6" />
      </button>
      <button
        className="absolute bottom-1/2 right-0 z-10 rounded-l-lg bg-slate-700 bg-opacity-50 p-2 text-white focus:outline-none"
        onClick={() => navigate("next")}
      >
        <ChevronRightIcon className="h-6 w-6" />
      </button>
      <div className="absolute bottom-0 flex w-full justify-center space-x-2 p-2">
        {images.map((_, index) => (
          <span
            className={clsx(
              "inline-block h-2 w-2 cursor-pointer rounded-full",
              currentIndex === index ? "bg-white" : "bg-slate-300",
            )}
            key={index}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
