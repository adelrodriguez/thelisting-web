import { Popover, Transition } from "@headlessui/react"
import type { ReactNode } from "react"
import { Fragment, useRef, useState } from "react"

export default function Tooltip({
  children,
  text,
}: {
  children: ReactNode
  text: string
}) {
  const [isHover, setIsHover] = useState(false)
  const ref = useRef(null)

  return (
    <Popover
      ref={ref}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className="relative inline-flex items-center"
    >
      <Popover.Button>{children}</Popover.Button>

      <Transition
        show={isHover}
        as={Fragment}
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Popover.Panel className="absolute top-6 z-10 w-48 rounded-md bg-gray-700 p-2 font-light text-white">
          {text}
        </Popover.Panel>
      </Transition>
    </Popover>
  )
}
