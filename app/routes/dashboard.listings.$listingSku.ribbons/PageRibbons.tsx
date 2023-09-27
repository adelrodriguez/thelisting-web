import type { Ribbon } from "@prisma/client"
import { useCallback, useEffect, useState } from "react"
import { useDrop } from "react-dnd"

import RibbonCard, { ItemTypes } from "./RibbonCard"

export default function PageRibbons({
  ribbons: originalRibbons,
  onMove,
}: {
  ribbons: Ribbon[]
  onMove: (ribbonIds: string[]) => void
}) {
  // We need to keep track of the ribbons in state so that we can show the
  // preview when moving them around
  const [ribbons, setRibbons] = useState(originalRibbons)
  const [, drop] = useDrop(() => ({ accept: ItemTypes.RIBBON }))
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    setRibbons(originalRibbons)
  }, [originalRibbons])

  useEffect(() => {
    if (isFinished) {
      onMove(ribbons.map((r) => r.id))
      setIsFinished(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished])

  const findCard = useCallback(
    (id: string) => {
      const index = ribbons.findIndex((c) => c.id === id)

      const card = ribbons[index]

      if (!card) throw new Error("Card not found")

      return [index, card] as const
    },
    [ribbons]
  )

  const moveCard = useCallback(
    (id: string, atIndex: number) => {
      const [index, card] = findCard(id)

      const newRibbons = [...ribbons]

      newRibbons.splice(index, 1)
      newRibbons.splice(atIndex, 0, card)

      setRibbons(newRibbons)
    },
    [findCard, ribbons]
  )

  const handleFinish = useCallback(() => {
    setIsFinished(true)
  }, [])

  return (
    <div className="h-auto">
      <ul ref={drop}>
        {ribbons.map((ribbon) => (
          <li className="py-2" key={ribbon.id}>
            <RibbonCard
              find={findCard}
              move={moveCard}
              onFinish={handleFinish}
              ribbon={ribbon}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
