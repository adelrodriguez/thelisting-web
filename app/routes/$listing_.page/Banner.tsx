import { Link } from "@remix-run/react"
import clsx from "clsx"
import { useTranslation } from "react-i18next"

import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import type { BannerProperties } from "~/utils/ribbons"

import SectionWrapper from "./SectionWrapper"
import useTheme from "./ThemeProvider"

export default function Banner({
  title,
  subtitle,
  backgroundImage,
  imageFit,
  imagePosition,
  decorationImage,
}: BannerProperties) {
  const { theme } = useTheme()
  const { t } = useTranslation("listing", { useSuspense: true })

  return (
    <SectionWrapper className="h-screen">
      <div className="flex h-full flex-col items-center justify-center">
        <div className="relative z-10 px-4">
          {decorationImage && (
            <div className="absolute inset-0 -top-10 h-32 -translate-y-full lg:h-40">
              <img
                alt=""
                className="h-full w-full object-contain"
                src={generateCloudflareImageUrl(decorationImage, "display")}
              />
            </div>
          )}
          <h1
            className="text-center text-5xl font-bold tracking-wide lg:text-7xl"
            style={{ fontFamily: theme.fonts?.heading }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-center text-xl font-light tracking-tight md:text-3xl">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          className={clsx(
            "right-1/2 z-10 mt-10 rounded-lg border-2 bg-transparent px-6 py-2.5 font-semibold tracking-wide shadow-sm outline-white transition-all ",
            "hover:scale-125 hover:shadow-2xl"
          )}
          relative="path"
          style={{ borderColor: theme.colors?.secondary }}
          to="../"
        >
          {t("goToRegistry")}
        </Link>
      </div>
      {backgroundImage && (
        <div className="absolute inset-0">
          <img
            alt=""
            className={clsx("h-full w-full", imageFit, imagePosition)}
            src={generateCloudflareImageUrl(backgroundImage, "display")}
          />
        </div>
      )}
    </SectionWrapper>
  )
}
