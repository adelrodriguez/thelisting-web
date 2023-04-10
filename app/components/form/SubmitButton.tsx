import { useNavigation } from "@remix-run/react"
import i18next from "i18next"

import { Button } from "~/components/common"
import { Spinner } from "~/components/loading"

export default function SubmitButton({
  children = `${i18next.t("common:submit")}`,
  loadingText = `${i18next.t("common:submitting")}...`,
  className,
}: {
  children?: React.ReactNode
  loadingText?: string
  className?: string
}) {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  return (
    <Button type="submit" className={className} disabled={isSubmitting}>
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
