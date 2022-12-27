import { useIsSubmitting } from "remix-validated-form"

import { Button } from "~/components/common"
import { Spinner } from "~/components/loading"

export default function FormSubmit({ text = "Submit" }: { text?: string }) {
  const isSubmitting = useIsSubmitting()

  return (
    <Button type="submit">
      {isSubmitting ? (
        <>
          <Spinner />
          Submitting...
        </>
      ) : (
        text
      )}
    </Button>
  )
}
