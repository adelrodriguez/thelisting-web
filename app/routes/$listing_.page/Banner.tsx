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
  const [styles, theme] = useTheme()
  const { t } = useTranslation("listing")

  return (
    <section>
      <div className="relative" style={styles}>
        {backgroundImage && (
          <div className="absolute inset-0">
            <img
              className={clsx("h-full w-full", imageFit, imagePosition)}
              src={generateCloudflareImageUrl(backgroundImage, "display")}
              alt=""
            />
          </div>
        )}

        <div className="relative flex h-screen flex-col items-center justify-center">
          {decorationImage && (
            <div className="h-32 lg:h-40">
              <img
                className="h-full w-full object-contain"
                src={generateCloudflareImageUrl(decorationImage, "display")}
                alt=""
              />
            </div>
          )}
          <div className="px-4 pt-10 pb-5">
            <h1 className="z-10 text-center font-headline text-5xl font-bold tracking-wide lg:text-6xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-center font-body text-xl font-light tracking-tight md:text-2xl">
                {subtitle}
              </p>
            )}
          </div>

          <Link to="../" relative="path">
            <button
              type="button"
              className="right-1/2 mt-10 rounded-lg border-2 bg-transparent px-6 py-2.5 font-body text-base font-semibold tracking-wide shadow-sm outline-white transition-all hover:scale-105 hover:shadow-2xl"
              style={{
                borderColor: theme.colors?.primary,
                color: theme.colors?.primary,
              }}
            >
              {t("goToRegistry")}
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
