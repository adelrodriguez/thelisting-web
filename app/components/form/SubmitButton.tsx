import i18next from "i18next"
import type { ComponentProps } from "react"
import { useIsSubmitting } from "remix-validated-form"

import { Button } from "~/components/common"
import { Spinner } from "~/components/loading"

export default function SubmitButton({
  children = `${i18next.t("common:submit")}`,
  loadingText = `${i18next.t("common:submitting")}...`,
  disabled,
  formId,
  ...props
}: {
  children?: React.ReactNode
  loadingText?: string
  formId?: string
} & Exclude<ComponentProps<typeof Button>, "type" | "children">) {
  const isSubmitting = useIsSubmitting(formId)

  return (
    <Button
      {...props}
      disabled={isSubmitting || disabled}
      form={formId}
      type="submit"
    >
      {isSubmitting ? (
        <>
          <Spinner />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
