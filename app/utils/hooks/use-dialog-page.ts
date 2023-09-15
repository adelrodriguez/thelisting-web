import { useNavigate } from "@remix-run/react"
import { useCallback, useState } from "react"

/**
 * This is used in pages where the main element is a dialog. By default this
 * should appear open and when we close it we should navigate back to the
 * previous page. We don't need a function to open the dialog since it should be
 * open when you navigate to the page.
 */
export default function useDialogPage() {
  const [open, setOpen] = useState(true)
  const navigate = useNavigate()
  const close = useCallback(() => setOpen(false), [])
  const leave = useCallback(
    () => navigate("../", { preventScrollReset: true }),
    [navigate]
  )

  return { close, leave, open }
}
