import { Link } from "@remix-run/react"
import clsx from "clsx"
import { useInView } from "framer-motion"
import { type ElementRef, useRef } from "react"
import { useTranslation } from "react-i18next"
import { route } from "routes-gen"

import type { BannerProperties } from "~/utils/ribbons"

import useTheme from "./ThemeProvider"

export default function Banner({
  backgroundImage,
  decorationImage,
  imageFit,
  imagePosition,
  path,
  subtitle,
  title,
  titleFont,
}: BannerProperties & { path: string }) {
  const { theme } = useTheme()
  const ref = useRef<ElementRef<"div">>(null)

  const { t } = useTranslation("listing", { useSuspense: true })
  const inView = useInView(ref, { amount: 0.5, once: true })

  return (
    <>
      <div
        className={clsx(
          "relative z-10 flex flex-col items-center justify-center gap-y-7 px-2 transition-transform duration-1000 ease-in-out md:px-4",
          inView ? "translate-y-0" : "translate-y-10",
        )}
        ref={ref}
      >
        {decorationImage && (
          <div className="h-32 lg:h-40">
            <img alt="" className="h-full w-full object-contain" src={decorationImage} />
          </div>
        )}
        <h1
          className="text-center text-3xl font-bold tracking-wide lg:text-5xl"
          style={{
            color: theme.colors?.primary,
            fontFamily: titleFont || theme.fonts?.heading,
          }}
        >
          {title}
        </h1>
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
