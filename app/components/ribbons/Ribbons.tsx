import type { Ribbon } from "@prisma/client"

import { Banner } from "~/components/ribbons"
import { BannerPropertiesSchema } from "~/utils/ribbon"

export default function Ribbons({ ribbons }: { ribbons: Ribbon[] }) {
  return (
    <>
      {ribbons.map((ribbon) => {
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
