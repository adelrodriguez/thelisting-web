import type { Ribbon } from "@prisma/client"
import { RibbonType } from "@prisma/client"

import { Banner, Countdown } from "~/components/ribbons"
import { parseBannerProperties, parseCountdownProperties } from "~/utils/ribbon"

// TODO(adelrodriguez): Add an error component to show when a ribbon fails to
// parse. It should consume the error message from the parse result.
export default function Ribbons({ ribbons }: { ribbons: Ribbon[] }) {
  return (
    <>
      {ribbons.map((ribbon) => {
        switch (ribbon.type) {
          case RibbonType.Banner: {
            const parseResult = parseBannerProperties(ribbon.properties)

            if (!parseResult.success) return null

            return <Banner {...parseResult.data} key={ribbon.id} />
          }
          case RibbonType.Countdown: {
            const parseResult = parseCountdownProperties(ribbon.properties)

            if (!parseResult.success) return null

            return <Countdown {...parseResult.data} key={ribbon.id} />
          }
          default:
            return null
        }
      })}
    </>
  )
}
