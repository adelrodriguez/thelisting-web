import type { LocationProperties } from "~/utils/ribbons"

import useTheme from "./ThemeProvider"

export default function Location({
  caption,
  address,
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
          className="w-full rounded-md shadow-lg"
          style={{ border: 0, height: height || "100vh" }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=${"AIzaSyAl-2Y0iQhC9oY3d-csjh2SOM-cJurXcg0"}
    &q=${encodeURIComponent(address!)}`}
          title={caption || "Map"}
        />
        {caption && <p className="mt-4 text-center text-lg">{caption}</p>}
      </div>
    </section>
  )
}
