import {
  Bars3CenterLeftIcon,
  ClockIcon,
  ComputerDesktopIcon,
  EllipsisVerticalIcon,
  MapIcon,
  PhotoIcon,
  PlusIcon,
  RectangleGroupIcon,
  RectangleStackIcon,
} from "@heroicons/react/20/solid"
import type { Ribbon } from "@prisma/client"
import { RibbonType } from "@prisma/client"
import { Link } from "@remix-run/react"
import clsx from "clsx"
import { useDrag, useDrop } from "react-dnd"

export const ItemTypes = {
  RIBBON: "ribbon",
}

const RIBBON_CARD = {
  [RibbonType.Banner]: {
    bgColor: "bg-amber-500",
    icon: <ComputerDesktopIcon aria-hidden="true" className="h-6 w-6" />,
  },
  [RibbonType.Countdown]: {
    bgColor: "bg-sky-500",
    icon: <ClockIcon aria-hidden="true" className="h-6 w-6" />,
  },
  [RibbonType.CoverImage]: {
    bgColor: "bg-purple-500",
    icon: <PhotoIcon aria-hidden="true" className="h-6 w-6" />,
  },
  [RibbonType.ImageCarousel]: {
    bgColor: "bg-green-500",
    icon: <RectangleStackIcon aria-hidden="true" className="h-6 w-6" />,
  },
  [RibbonType.ImageGallery]: {
    bgColor: "bg-blue-500",
    icon: <RectangleGroupIcon aria-hidden="true" className="h-6 w-6" />,
  },
  [RibbonType.Location]: {
    bgColor: "bg-red-500",
    icon: <MapIcon aria-hidden="true" className="h-6 w-6" />,
  },
  [RibbonType.Text]: {
    bgColor: "bg-gray-500",
    icon: <Bars3CenterLeftIcon aria-hidden="true" className="h-6 w-6" />,
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
      <Link to={ribbon.id}>
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
                aria-hidden="true"
                className="-mr-3 h-5 w-auto"
              />
              <EllipsisVerticalIcon aria-hidden="true" className="h-5 w-auto" />
            </div>
          </div>
        </div>
      </Link>
      <div
        className={clsx("relative mt-2 hidden", {
          "group-hover:block": !isDragging,
        })}
      >
        <div aria-hidden="true" className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <Link
            preventScrollReset
            relative="route"
            to={`new?position=${ribbon.position + 1}`}
          >
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
