import { Link } from "@remix-run/react"
import clsx from "clsx"
import { useTranslation } from "react-i18next"

import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import type { BannerProperties } from "~/utils/ribbons"

import useTheme from "./ThemeProvider"

export default function Banner({
  title,
  subtitle,
  backgroundImage,
  imageFit,
  imagePosition,
  decorationImage,
}: BannerProperties) {
  const [styles] = useTheme()
  const { t } = useTranslation("listing")

  return (
    <section>
      <div className="relative" style={styles}>
        <div className="flex h-screen flex-col items-center justify-center">
          <div className="relative px-4">
            {decorationImage && (
              <div className="absolute inset-0 -top-10 h-32 -translate-y-full lg:h-40">
                <img
                  className="h-full w-full object-contain"
                  src={generateCloudflareImageUrl(decorationImage, "display")}
                  alt=""
                />
              </div>
            )}
            <h1 className="text-center font-headline text-5xl font-bold tracking-wide lg:text-6xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-center font-body text-xl font-light tracking-tight md:text-2xl">
                {subtitle}
              </p>
            )}
          </div>

          <Link
            to="../"
            relative="path"
            className={clsx(
              "right-1/2 z-10 mt-10 rounded-lg border-2 bg-transparent px-6 py-2.5 font-body font-semibold tracking-wide shadow-sm outline-white transition-all ",
              "hover:scale-125 hover:bg-white hover:text-black hover:mix-blend-screen hover:shadow-2xl"
            )}
          >
            {t("goToRegistry")}
          </Link>
        </div>
        {backgroundImage && (
          <div className="absolute inset-0">
            <img
              className={clsx("h-full w-full", imageFit, imagePosition)}
              src={generateCloudflareImageUrl(backgroundImage, "display")}
              alt=""
            />
          </div>
        )}
      </div>
    </section>
  )
}
