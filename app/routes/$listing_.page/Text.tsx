import { Link } from "@remix-run/react"
import clsx from "clsx"

import type { TextProperties } from "~/utils/ribbons"

import useTheme from "./ThemeProvider"

export default function Text({
  body,
  decorationImage,
  hasUrl,
  textAlignment,
  title,
  url,
  urlLabel,
}: TextProperties) {
  const { theme } = useTheme()

  return (
    <div className="flex w-full flex-col items-center gap-y-4 px-6 md:px-8">
      {decorationImage && (
        <div className="h-32 lg:h-40">
          <img
            alt=""
            className="h-full w-full object-contain"
            src={decorationImage}
          />
        </div>
      )}
      {title && (
        <h3
          className="pb-4 text-center text-2xl font-semibold tracking-wide md:text-3xl"
          style={{ fontFamily: theme.fonts?.heading }}
        >
          {title}
        </h3>
      )}
      <p
        className={clsx(
          "whitespace-pre-wrap font-light leading-7",
          textAlignment,
        )}
        style={{ fontFamily: theme.fonts?.body }}
      >
        {body}
      </p>
      {hasUrl && url && (
        <Link
          className={clsx(
            "block w-auto rounded-lg border-2 bg-transparent px-6 py-2.5 text-center transition-all",
            "hover:scale-110 hover:shadow-2xl",
          )}
          style={{
            borderColor: theme.colors?.primary,
          }}
          to={url}
        >
          {urlLabel}
        </Link>
      )}
    </div>
  )
}
