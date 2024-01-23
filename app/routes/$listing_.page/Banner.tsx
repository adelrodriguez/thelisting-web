import { Link } from "@remix-run/react"
import clsx from "clsx"
import { useTranslation } from "react-i18next"

import type { BannerProperties } from "~/utils/ribbons"

import useTheme from "./ThemeProvider"

export default function Banner({
  backgroundImage,
  decorationImage,
  imageFit,
  imagePosition,
  subtitle,
  title,
}: BannerProperties) {
  const { theme } = useTheme()
  const { t } = useTranslation("listing", { useSuspense: true })

  return (
    <>
      <div className="flex h-full items-center justify-center">
        <div className="relative z-10 flex flex-col items-center gap-y-7 px-2 md:px-4">
          {decorationImage && (
            <div className="absolute inset-0 top-0 h-32 -translate-y-full lg:h-40">
              <img
                alt=""
                className="h-full w-full object-contain"
                src={decorationImage}
              />
            </div>
          )}
          <h1
            className="text-center text-3xl font-bold tracking-wide lg:text-5xl"
            style={{
              color: theme.colors?.primary,
              fontFamily: theme.fonts?.heading,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-center text-xl font-light tracking-tight lg:text-2xl"
              style={{
                color: theme.colors?.primary,
                fontFamily: theme.fonts?.body,
              }}
            >
              {subtitle}
            </p>
          )}
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
            to="../"
          >
            {t("registry")}
          </Link>
        </div>
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
