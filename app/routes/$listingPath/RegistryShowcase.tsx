import { Link } from "@remix-run/react"
import clsx from "clsx"
import Autoplay from "embla-carousel-autoplay"
import useEmblaCarousel from "embla-carousel-react"
import { useTranslation } from "react-i18next"
import { route } from "routes-gen"

import { ONE_SECOND } from "~/config/consts"
import { RegistryShowcaseProperties } from "~/utils/ribbons"

import useTheme from "./ThemeProvider"

export default function RegistryShowcase({
  backgroundImage,
  decorationImage,
  imageFit,
  imagePosition,
  itemCount,
  items,
  path,
  subtitle,
  title,
}: {
  items: { id: string; data: { title: string; imageUrl: string } }[]
  path: string
} & RegistryShowcaseProperties) {
  const { theme } = useTheme()
  const { t } = useTranslation("listing", { useSuspense: true })
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({
      delay: ONE_SECOND.inMilliseconds * 2,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
    }),
  ])

  return (
    <>
      <div className="relative z-10 flex h-screen w-full flex-col items-center justify-center gap-y-7">
        {decorationImage && (
          <div className="h-32 lg:h-40">
            <img
              alt=""
              className="h-full w-full object-contain"
              src={decorationImage}
            />
          </div>
        )}
        <h2
          className="text-center text-3xl font-bold tracking-wide lg:text-5xl"
          style={{
            color: theme.colors?.primary,
            fontFamily: theme.fonts?.heading,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="text-center text-sm font-light tracking-tight md:text-base lg:text-lg"
            style={{
              color: theme.colors?.primary,
              fontFamily: theme.fonts?.body,
            }}
          >
            {subtitle}
          </p>
        )}
        <div className="w-full overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {items.slice(0, itemCount).map((item, index) => (
              <div
                className="relative mx-4 flex h-40 min-w-0 shrink-0 grow-0 basis-24 items-center lg:h-64 lg:basis-32"
                key={item.id}
              >
                <img
                  alt={item.data.title}
                  className={clsx(
                    "absolute h-24 w-full rounded-2xl object-cover shadow-lg lg:h-32",
                    "transition-transform duration-300 hover:scale-125",
                    index % 2 === 0 ? "-rotate-3" : "rotate-3",
                  )}
                  src={item.data.imageUrl}
                />
              </div>
            ))}
          </div>
        </div>
        <Link
          className={clsx(
            "rounded-lg border-2 bg-transparent px-6 py-2.5 tracking-wide shadow-sm outline-white transition-all",
            "hover:scale-110 hover:shadow-2xl",
          )}
          relative="path"
          style={{
            borderColor: theme.colors?.primary,
            color: theme.colors?.primary,
            fontFamily: theme.fonts?.body,
          }}
          to={route("/:listingPath/registry", { listingPath: path })}
        >
          {t("registry")}
        </Link>
      </div>
      {backgroundImage && (
        <div className="absolute inset-0">
          <img
            alt=""
            className={clsx("h-full w-full", imageFit, imagePosition)}
            loading="lazy"
            src={backgroundImage}
          />
        </div>
      )}
    </>
  )
}
