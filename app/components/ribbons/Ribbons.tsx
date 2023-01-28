import type { Listing, Ribbon } from "@prisma/client"

import { Banner, BannerPropertiesSchema } from "~/components/ribbons"

export default function Ribbons({
  listing,
}: {
  listing: Listing & { ribbons: Ribbon[] }
}) {
  return (
    <>
      {listing.ribbons.map((ribbon) => {
        switch (ribbon.type) {
          case "Banner":
            const properties = BannerPropertiesSchema.parse(ribbon.properties)
            return <Banner {...properties} key={ribbon.id} />
          default:
            return null
        }
      })}
    </>
  )
}
