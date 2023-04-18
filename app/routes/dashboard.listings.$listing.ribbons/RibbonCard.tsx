import { Disclosure } from "@headlessui/react"
import {
  ClockIcon,
  ComputerDesktopIcon,
  EllipsisVerticalIcon,
  PhotoIcon,
  PlusIcon,
} from "@heroicons/react/20/solid"
import type { Ribbon } from "@prisma/client"
import { RibbonType } from "@prisma/client"
import { Link } from "@remix-run/react"
import clsx from "clsx"
import { useDrag, useDrop } from "react-dnd"

import BannerRibbonForm from "./BannerRibbonForm"
import CountdownRibbonForm from "./CountdownRibbonForm"
import CoverImageRibbonForm from "./CoverImageRibbonForm"

export const ItemTypes = {
  RIBBON: "ribbon",
}

const RIBBON_CARD = {
  [RibbonType.Banner]: {
    bgColor: "bg-amber-500",
    icon: <ComputerDesktopIcon className="h-6 w-6" aria-hidden="true" />,
  },
  [RibbonType.Countdown]: {
    bgColor: "bg-sky-500",
    icon: <ClockIcon className="h-6 w-6" aria-hidden="true" />,
  },
  [RibbonType.CoverImage]: {
    bgColor: "bg-purple-500",
    icon: <PhotoIcon className="h-6 w-6" aria-hidden="true" />,
  },
}

export default function RibbonCard({
  ribbon,
  move,
  find,
  onFinish,
}: {
  ribbon: Ribbon
  move: (id: string, atIndex: number) => void
  find: (id: string) => readonly [number, Ribbon]
  onFinish: () => void
}) {
  const originalIndex = find(ribbon.id)[0]

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const { id: droppedId, originalIndex } = item
      const didDrop = monitor.didDrop()

      if (!didDrop) {
        move(droppedId, originalIndex)
      } else {
        onFinish()
      }
    },
    item: { id: ribbon.id, originalIndex },
    type: ItemTypes.RIBBON,
  }))

  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.RIBBON,
      hover({ id: draggedId }: Ribbon) {
        if (draggedId !== ribbon.id) {
          const [overIndex] = find(ribbon.id)

          move(draggedId, overIndex)
        }
      },
    }),
    [move, find]
  )

  return (
    <div className="group">
      <Disclosure>
        <Disclosure.Button className="w-full text-left">
          <div
            className={clsx(
              "col-span-1 flex rounded-md shadow-sm transition-opacity",
              isDragging ? "opacity-0" : "opacity-100"
            )}
            ref={(node) => preview(drop(node))}
          >
            <div
              className={clsx(
                "flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white",
                RIBBON_CARD[ribbon.type].bgColor
              )}
            >
              {RIBBON_CARD[ribbon.type].icon}
            </div>
            <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-b border-r border-t border-gray-200 bg-white">
              <div className="flex-1 truncate px-4 py-2 text-sm">
                <h3 className="font-medium text-gray-900 hover:text-gray-600">
                  {ribbon.name}
                </h3>
                <p className="text-gray-500">{ribbon.type}</p>
              </div>
              <div
                className="flex flex-shrink-0 pr-2 hover:cursor-grab"
                ref={drag}
              >
                <EllipsisVerticalIcon
                  className="-mr-3 h-5 w-auto"
                  aria-hidden="true"
                />
                <EllipsisVerticalIcon
                  className="h-5 w-auto"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </Disclosure.Button>
        <Disclosure.Panel className="py-2">
          {!isDragging && (
            <>
              {ribbon.type === RibbonType.Banner && (
                <BannerRibbonForm ribbon={ribbon} />
              )}
              {ribbon.type === RibbonType.Countdown && (
                <CountdownRibbonForm ribbon={ribbon} />
              )}
              {ribbon.type === RibbonType.CoverImage && (
                <CoverImageRibbonForm ribbon={ribbon} />
              )}
            </>
          )}
        </Disclosure.Panel>
      </Disclosure>
      <div
        className={clsx("relative mt-2 hidden", {
          "group-hover:block": !isDragging,
        })}
      >
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <Link
            to={`new?position=${ribbon.position + 1}`}
            relative="route"
            preventScrollReset
          >
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
    </div>
  )
}
