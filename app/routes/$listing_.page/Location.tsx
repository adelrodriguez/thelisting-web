import type { LocationProperties } from "~/utils/ribbons"

import useTheme from "./ThemeProvider"

export default function Location({
  caption,
  embedCode,
  height,
}: LocationProperties) {
  const [styles] = useTheme()
  const regex = /<iframe[^>]*src="([^"]*)/i
  const match = embedCode.match(regex)
  const src = match ? match[1] : null

  if (!src) {
    return null
  }

  return (
    <section>
      <div className="px-4 pb-10" style={styles}>
        <iframe
          src={`${src}&z=12z`}
          className="w-full rounded-md shadow-lg"
          style={{ border: 0, height: height || "100vh" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={caption || "Map"}
        />
        {caption && <p className="mt-4 text-center text-lg">{caption}</p>}
      </div>
    </section>
  )
}
