import { PlusIcon } from "@heroicons/react/20/solid"
import type { Ribbon } from "@prisma/client"
import { Link } from "@remix-run/react"
import { useCallback, useEffect, useState } from "react"
import { useDrop } from "react-dnd"

import RibbonCard, { ItemTypes } from "./RibbonCard"

export default function PageRibbons({
  onMove,
  ribbons: originalRibbons,
}: {
  ribbons: Pick<Ribbon, "name" | "type" | "id">[]
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
  }, [isFinished, onMove, ribbons])

  const findCard = useCallback(
    (id: string) => {
      const index = ribbons.findIndex((c) => c.id === id)

      const card = ribbons[index]

      if (!card) throw new Error("Card not found")

      return [index, card] as const
    },
    [ribbons],
  )

  const moveCard = useCallback(
    (id: string, atIndex: number) => {
      const [index, card] = findCard(id)

      const newRibbons = [...ribbons]

      newRibbons.splice(index, 1)
      newRibbons.splice(atIndex, 0, card)

      setRibbons(newRibbons)
    },
    [findCard, ribbons],
  )

  return (
    <div className="h-auto">
      <ul ref={drop}>
        {ribbons.map((ribbon) => (
          <li className="py-2" key={ribbon.id}>
            <RibbonCard
              {...ribbon}
              find={findCard}
              move={moveCard}
              onDrop={() => {
                setIsFinished(true)
              }}
            />
          </li>
        ))}
      </ul>
      <div className="relative mt-2">
        <div aria-hidden="true" className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <Link preventScrollReset relative="route" to="new">
            <button className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              <PlusIcon
                aria-hidden="true"
                className="-ml-1 -mr-0.5 h-5 w-5 text-gray-400"
              />
              Add new ribbon
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
