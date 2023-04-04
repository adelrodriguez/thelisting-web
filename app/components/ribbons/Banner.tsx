import clsx from "clsx"

import {
  CLOUDFLARE_IMAGE_VARIANTS,
  generateCloudflareImageUrl,
} from "~/utils/cloudflare"
import type { BannerProperties } from "~/utils/ribbon"

export default function Banner({
  title,
  subtitle,
  backgroundImage,
}: BannerProperties) {
  return (
    <section>
      <div className="relative bg-gray-800">
        <div className="absolute inset-0">
          {backgroundImage && (
            <img
              className="h-full w-full object-cover object-center"
              src={generateCloudflareImageUrl(
                backgroundImage,
                CLOUDFLARE_IMAGE_VARIANTS.Display
              )}
              alt=""
            />
          )}
          <div
            className={clsx("absolute inset-0 bg-gray-500", {
              "mix-blend-multiply": !!backgroundImage,
            })}
            aria-hidden="true"
          />
        </div>
        <div className="relative mx-auto max-w-7xl py-16 px-6 md:py-24 lg:py-32 lg:px-8">
          <h1 className="font-headline text-4xl font-bold text-white sm:text-5xl md:text-center lg:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 font-body text-lg text-white md:text-center md:text-xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
