import { PlusIcon } from "@heroicons/react/20/solid"
import type { Ribbon, RibbonType } from "@prisma/client"
import { Link, Outlet } from "@remix-run/react"

import RibbonCard from "./RibbonCard"

export const ItemTypes = {
  NEW_RIBBON: "ribbon",
  PAGE_RIBBON: "existing-ribbon",
}

export type PageRibbon = {
  type: RibbonType
  id: string
  index: number
}

export default function PageRibbons({
  ribbons,
  move,
}: {
  ribbons: Ribbon[]
  move: (dragIndex: number, hoverIndex: number) => void
}) {
  return (
    <div className="h-auto">
      <ul>
        {ribbons.map((ribbon) => (
          <li key={ribbon.id} className="py-2">
            <RibbonCard ribbon={ribbon} move={move} />
          </li>
        ))}
      </ul>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <Link to="add" relative="path" preventScrollReset>
            <button className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              <PlusIcon
                className="-ml-1 -mr-0.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              Add new ribbon
            </button>
          </Link>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
