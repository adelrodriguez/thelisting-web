import { EllipsisVerticalIcon } from "@heroicons/react/20/solid"
import type { Ribbon } from "@prisma/client"
import clsx from "clsx"
import { useDrag, useDrop } from "react-dnd"

export const ItemTypes = {
  RIBBON: "ribbon",
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
    []
  )

  return (
    <>
      <div
        className={clsx(
          "col-span-1 flex rounded-md shadow-sm transition-opacity",
          isDragging ? "opacity-0" : "opacity-100"
        )}
        ref={(node) => preview(drop(node))}
      >
        <div
          className={clsx(
            "flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white"
            // color
          )}
        >
          {/* {icon} */}
        </div>
        <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-b border-r border-t border-gray-200 bg-white">
          <div className="flex-1 truncate px-4 py-2 text-sm">
            <h3 className="font-medium text-gray-900 hover:text-gray-600">
              {ribbon.name}
            </h3>
            <p className="text-gray-500">Some description</p>
          </div>
          <div className="flex flex-shrink-0 pr-2 hover:cursor-grab" ref={drag}>
            <EllipsisVerticalIcon
              className="-mr-3 h-5 w-auto"
              aria-hidden="true"
            />
            <EllipsisVerticalIcon className="h-5 w-auto" aria-hidden="true" />
          </div>
        </div>
      </div>
    </>
  )
}
