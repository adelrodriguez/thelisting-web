import {
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/solid"
import type { Listing, Ribbon } from "@prisma/client"
import clsx from "clsx"
import { useEffect, useRef, useState } from "react"

export default function RibbonsPreview({
  ribbons,
  path,
}: {
  ribbons: Ribbon[]
  path: Listing["path"]
}) {
  const [previewSize, setPreviewSize] = useState<"mobile" | "desktop">(
    "desktop",
  )
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const ref = useRef<HTMLIFrameElement>(null)
  const SCALE = 4
  const PREVIEW_HEIGHT = previewSize === "mobile" ? 600 : 300

  useEffect(() => {
    function handleResize() {
      setContainerWidth(containerRef.current?.clientWidth ?? 0)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    // When the ribbons change, reload the iframe to show the latest changes
    if (ref.current && ref.current.contentWindow) {
      ref.current.contentWindow.location.reload()
    }
  }, [ribbons])

  useEffect(() => {
    setContainerWidth(containerRef.current?.clientWidth ?? 0)
  }, [containerRef.current?.clientWidth])

  return (
    <>
      <div className="mx-auto border border-gray-300" ref={containerRef}>
        <div
          className="overflow-hidden"
          style={{ height: PREVIEW_HEIGHT, width: containerWidth }}
        >
          <iframe
            className={clsx({
              "h-full w-full": previewSize === "mobile",
              "origin-[0_0] scale-[25%]": previewSize === "desktop",
            })}
            src={`/${path}/page`}
            title="preview"
            {...(previewSize === "desktop" && {
              style: {
                height: PREVIEW_HEIGHT * SCALE,
                width: containerWidth * SCALE,
              },
            })}
            ref={ref}
          />
        </div>
      </div>
      <div className="flex justify-center py-2">
        <span className="isolate inline-flex rounded-md shadow-sm">
          <button
            className={clsx(
              "relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300",
              "focus:z-10",
              previewSize === "mobile"
                ? "bg-gray-600"
                : "bg-white hover:bg-gray-50",
            )}
            disabled={previewSize === "mobile"}
            onClick={() => setPreviewSize("mobile")}
            type="button"
          >
            <DevicePhoneMobileIcon
              className={clsx(
                "h-5 w-5",
                previewSize === "mobile" ? "text-white" : "text-gray-700",
              )}
            />
          </button>

          <button
            className={clsx(
              "relative -ml-px inline-flex items-center rounded-r-md  px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300",
              "hover:bg-gray-50",
              "focus:z-10",
              previewSize === "desktop"
                ? "bg-gray-600"
                : "bg-white hover:bg-gray-50",
            )}
            disabled={previewSize === "desktop"}
            onClick={() => setPreviewSize("desktop")}
            type="button"
          >
            <ComputerDesktopIcon
              className={clsx(
                "h-5 w-5",
                previewSize === "desktop" ? "text-white" : "text-gray-700",
              )}
            />
          </button>
        </span>
      </div>
    </>
  )
}
