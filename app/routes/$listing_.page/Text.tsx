import { Link } from "@remix-run/react"
import clsx from "clsx"

import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import type { TextProperties } from "~/utils/ribbons"

import SectionWrapper from "./SectionWrapper"
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
    <SectionWrapper className="h-screen min-h-screen">
      <div className="flex h-full items-center">
        <div className="w-full px-4">
          {decorationImage && (
            <div className="h-32 lg:h-40">
              <img
                className="h-full w-full object-contain"
                src={generateCloudflareImageUrl(decorationImage, "display")}
                alt=""
              />
            </div>
          )}
          <div className={clsx("pt-10", textAlignment)}>
            <h3
              className="text-2xl font-semibold tracking-wide md:text-3xl"
              style={{ fontFamily: theme.fonts?.heading }}
            >
              {title}
            </h3>
            <p className="mt-4 whitespace-pre-wrap text-lg leading-7">{body}</p>
            {hasUrl && (
              <div className="mt-8">
                <Link
                  to={url!}
                  className={clsx(
                    "mt-4 rounded-full border-2 border-white bg-transparent px-6 py-2.5 font-semibold tracking-wide text-white transition-all",
                    "hover:bg-white hover:text-black hover:mix-blend-screen"
                  )}
                >
                  {urlLabel}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
