import { useIsSubmitting } from "remix-validated-form"

import { Button } from "~/components/common"
import { Spinner } from "~/components/loading"

export default function FormSubmit({
  text = "Submit",
  loadingText = "Submitting...",
  className,
}: {
  text?: string
  loadingText?: string
  className?: string
}) {
  const isSubmitting = useIsSubmitting()

  return (
    <Button type="submit" className={className}>
      {isSubmitting ? (
        <>
          <Spinner />
          {loadingText}
        </>
      ) : (
        text
      )}
    </Button>
  )
}
