import clsx from "clsx"

import { generateCloudflareImageUrl } from "~/utils/cloudflare"
import type { TextProperties } from "~/utils/ribbons"

import useTheme from "./ThemeProvider"

export default function Text({
  title,
  body,
  decorationImage,
  textAlignment,
}: TextProperties) {
  const [styles] = useTheme()

  return (
    <section>
      <div style={styles} className="px-8 py-20">
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
          <h3 className="font-serif text-2xl font-semibold tracking-wide md:text-3xl">
            {title}
          </h3>
          <p className="mt-4 whitespace-pre-wrap font-body text-lg leading-7 tracking-tight">
            {body}
          </p>
        </div>
      </div>
    </section>
  )
}
