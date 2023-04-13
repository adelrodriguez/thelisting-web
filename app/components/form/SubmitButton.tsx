import { useNavigation } from "@remix-run/react"
import i18next from "i18next"
import type { ComponentProps } from "react"

import { Button } from "~/components/common"
import { Spinner } from "~/components/loading"

export default function SubmitButton({
  children = `${i18next.t("common:submit")}`,
  loadingText = `${i18next.t("common:submitting")}...`,
  disabled,
  ...props
}: {
  children?: React.ReactNode
  loadingText?: string
} & Exclude<ComponentProps<typeof Button>, "type" | "children">) {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  return (
    <Button {...props} type="submit" disabled={isSubmitting || disabled}>
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
