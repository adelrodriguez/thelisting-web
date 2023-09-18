import i18next from "i18next"
import { useIsSubmitting } from "remix-validated-form"

import { Button } from "~/components/common"
import { Spinner } from "~/components/loading"

export default function FormSubmit({
  text = `${i18next.t("common:submit")}`,
  loadingText = `${i18next.t("common:submitting")}...`,
  className,
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
