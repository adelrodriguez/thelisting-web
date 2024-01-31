import {
  Bars3CenterLeftIcon,
  ClockIcon,
  ComputerDesktopIcon,
  EllipsisVerticalIcon,
  GiftIcon,
  MapIcon,
  PaperClipIcon,
  PhotoIcon,
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
  [RibbonType.RegistryShowcase]: {
    bgColor: "bg-rose-500",
    icon: <GiftIcon aria-hidden="true" className="h-6 w-6" />,
  },
  [RibbonType.Text]: {
    bgColor: "bg-gray-500",
    icon: <Bars3CenterLeftIcon aria-hidden="true" className="h-6 w-6" />,
  },
  [RibbonType.Embedded]: {
    bgColor: "bg-indigo-500",
    icon: <PaperClipIcon aria-hidden="true" className="h-6 w-6" />,
  },
} satisfies {
  [key in RibbonType]: {
    bgColor: string
    icon: JSX.Element
  }
}

export default function RibbonCard({
  find,
  id,
  move,
  name,
  onDrop,
  type,
}: {
  find: (id: string) => readonly [number, Pick<Ribbon, "name" | "type" | "id">]
  id: string
  move: (id: string, atIndex: number) => void
  name: string
  onDrop: () => void
  type: RibbonType
}) {
  const originalIndex = find(id)[0]

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    end: (item, monitor) => {
      const { id: droppedId, originalIndex } = item
      const didDrop = monitor.didDrop()

      if (didDrop) {
        onDrop()
        return
      }

      move(droppedId, originalIndex)
    },
    item: { id, originalIndex },
    type: ItemTypes.RIBBON,
  }))

  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.RIBBON,
      hover({ id: draggedId }: Ribbon) {
        if (draggedId === id) return

        const [overIndex] = find(id)

        move(draggedId, overIndex)
      },
    }),
    [move, find],
  )

  return (
    <div className="group">
      <Link to={id}>
        <div
          className={clsx(
            "col-span-1 flex rounded-md shadow-sm transition-opacity",
            isDragging ? "opacity-0" : "opacity-100",
          )}
          ref={(node) => preview(drop(node))}
        >
          <div
            className={clsx(
              "flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white",
              RIBBON_CARD[type].bgColor,
            )}
          >
            {RIBBON_CARD[type].icon}
          </div>
          <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-b border-r border-t border-gray-200 bg-white">
            <div className="flex-1 truncate px-4 py-2 text-sm">
              <h3 className="font-medium text-gray-900 hover:text-gray-600">
                {name}
              </h3>
              <p className="text-gray-500">{type}</p>
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
    </div>
  )
}
