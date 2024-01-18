import type { LocationProperties } from "~/utils/ribbons"

export default function Location({ address, caption }: LocationProperties) {
  return (
    <div>
      <iframe
        allowFullScreen
        className="h-screen w-full border-0 shadow-lg"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/place?key=${"AIzaSyAl-2Y0iQhC9oY3d-csjh2SOM-cJurXcg0"}
    &q=${encodeURIComponent(address)}`}
        title={caption || "Map"}
      />
      {caption && <p className="mt-4 text-center text-lg">{caption}</p>}
    </div>
  )
}
