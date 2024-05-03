import type { LocationProperties } from "~/utils/ribbons"

export default function Location({ address, caption, height, zoom }: LocationProperties) {
  return (
    <div className="flex-center w-full p-4 md:p-8" style={{ height }}>
      <iframe
        allowFullScreen
        className="h-full w-full rounded-lg"
        loading="eager"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/place?key=${"AIzaSyAl-2Y0iQhC9oY3d-csjh2SOM-cJurXcg0"}
    &q=${encodeURIComponent(address)}&zoom=${zoom}`}
        title={caption || "Map"}
      />
    </div>
  )
}
