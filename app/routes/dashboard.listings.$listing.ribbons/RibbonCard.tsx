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
}: {
  ribbon: Ribbon
  move: (dragIndex: number, hoverIndex: number) => void
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    item: { id: ribbon.id, position: ribbon.position, type: ItemTypes.RIBBON },
    type: ItemTypes.RIBBON,
  }))

  const [{ isOver }, drop] = useDrop<Ribbon, unknown, { isOver: boolean }>(
    () => ({
      accept: ItemTypes.RIBBON,

      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
      drop: ({ id: draggedId, position: draggedPosition }) => {
        if (draggedId !== ribbon.id) {
          move(draggedPosition, ribbon.position)
        }
      },
    }),
    []
  )

  return (
    <>
      <div
        className={clsx("col-span-1 flex rounded-md shadow-sm", {
          "opacity-50": isDragging,
        })}
        ref={(node) => drag(drop(node))}
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
          <div className="flex flex-shrink-0 pr-2 hover:cursor-grab">
            <EllipsisVerticalIcon className="h-5 w-auto" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div
        className={clsx("h-0 w-full transition-all", {
          "h-16": isOver,
        })}
      />
    </>
  )
}
