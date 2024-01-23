import type { LocationProperties } from "~/utils/ribbons"

import useTheme from "./ThemeProvider"

export default function Location({ address, caption }: LocationProperties) {
  const { theme } = useTheme()

  return (
    <div className="flex h-96 flex-col gap-y-4 rounded-lg px-4">
      <h3
        className="text-center text-2xl font-bold"
        style={{ fontFamily: theme.fonts?.heading }}
      >
        Location
      </h3>
      <iframe
        allowFullScreen
        className="h-full w-full rounded-lg border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/place?key=${"AIzaSyAl-2Y0iQhC9oY3d-csjh2SOM-cJurXcg0"}
    &q=${encodeURIComponent(address)}`}
        title={caption || "Map"}
      />
      {caption && <p className="text-center text-sm">{caption}</p>}
    </div>
  )
}
