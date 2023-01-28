import clsx from "clsx"
import { z } from "zod"

export const BannerPropertiesSchema = z.object({
  backgroundImage: z.string().url().optional(),
  title: z.string(),
})
export type BannerProperties = z.infer<typeof BannerPropertiesSchema>

export default function Banner({ title, backgroundImage }: BannerProperties) {
  return (
    <section>
      <div className="relative bg-gray-800">
        <div className="absolute inset-0">
          {backgroundImage && (
            <img
              className="h-full w-full object-cover object-center"
              src={backgroundImage}
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
        <div className="relative mx-auto max-w-7xl py-32 px-6 sm:py-48 md:py-48 lg:py-64 lg:px-8">
          <h1 className="text-4xl font-headline font-bold text-white sm:text-5xl lg:text-6xl md:text-center">
            {title}
          </h1>
        </div>
      </div>
    </section>
  )
}
