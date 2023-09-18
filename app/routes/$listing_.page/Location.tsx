import type { LocationProperties } from "~/utils/ribbons"

import SectionWrapper from "./SectionWrapper"

export default function Location({ caption, address }: LocationProperties) {
  return (
    <SectionWrapper>
      <div className="pb-10">
        <iframe
          className="h-screen w-full border-0 shadow-lg"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=${"AIzaSyAl-2Y0iQhC9oY3d-csjh2SOM-cJurXcg0"}
    &q=${encodeURIComponent(address)}`}
          title={caption || "Map"}
        />
        {caption && <p className="mt-4 text-center text-lg">{caption}</p>}
      </div>
    </SectionWrapper>
  )
}
