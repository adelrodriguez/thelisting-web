import {
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/solid"
import type { Ribbon } from "@prisma/client"
import clsx from "clsx"
import { useState } from "react"

import { Ribbons } from "~/components/ribbons"

export default function RibbonsPreview({ ribbons }: { ribbons: Ribbon[] }) {
  const [previewSize, setPreviewSize] = useState<"mobile" | "desktop">(
    "desktop"
  )

  return (
    <>
      <div className="max-w-full overflow-y-auto overflow-x-hidden">
        <div
          className={clsx("h-[500px]", {
            "w-[100%] origin-[0_0] scale-[100%]": previewSize === "mobile",
            "w-[200%] origin-[0_0] scale-[50%]": previewSize === "desktop",
          })}
        >
          <Ribbons ribbons={ribbons} />
        </div>
      </div>
      <div className="flex justify-center py-2">
        <span className="isolate inline-flex rounded-md shadow-sm">
          <button
            type="button"
            className="relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
            onClick={() => setPreviewSize("mobile")}
          >
            <DevicePhoneMobileIcon className="h-5 w-5 text-gray-700" />
          </button>

          <button
            type="button"
            className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
            onClick={() => setPreviewSize("desktop")}
          >
            <ComputerDesktopIcon className="h-5 w-5 text-gray-700" />
          </button>
        </span>
      </div>
    </>
  )
}
