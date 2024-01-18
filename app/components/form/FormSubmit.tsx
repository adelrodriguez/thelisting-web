import i18next from "i18next"
import { useIsSubmitting } from "remix-validated-form"

import { Button } from "~/components/common"
import { Spinner } from "~/components/loading"

/**
 * @deprecated Use SubmitButton instead.
 */
export default function FormSubmit({
  className,
  loadingText = `${i18next.t("common:submitting")}...`,
  text = `${i18next.t("common:submit")}`,
}: {
  text?: string
  loadingText?: string
  className?: string
}) {
  const isSubmitting = useIsSubmitting()

  return (
    <Button className={className} disabled={isSubmitting} type="submit">
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
