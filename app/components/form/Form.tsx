import { zodResolver } from "@hookform/resolvers/zod"
import type { ReactElement, ReactNode } from "react"
import { useEffect } from "react"
import type {
  DefaultValues,
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form"
import { FormProvider, useForm } from "react-hook-form"
import type { ZodSchema } from "zod"

export default function Form<FormData extends FieldValues>({
  children,
  className,
  defaultValues,
  onError,
  onSubmit,
  resetOnSubmit = false,
  schema,
}: {
  children: ReactNode | ((methods: UseFormReturn<FormData>) => ReactNode)
  className?: string
  defaultValues?: DefaultValues<FormData>
  onError?: SubmitErrorHandler<FormData>
  onSubmit: SubmitHandler<FormData>
  resetOnSubmit?: boolean
  schema: ZodSchema<FormData>
}): ReactElement {
  const methods = useForm<FormData>({
    defaultValues,
    resolver: zodResolver(schema),
  })
  const {
    formState: { isSubmitSuccessful },
    reset,
  } = methods

  useEffect(() => {
    if (isSubmitSuccessful && resetOnSubmit) {
      reset()
    }
  }, [isSubmitSuccessful, resetOnSubmit, reset])

  if (typeof children === "function") {
    return (
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit, onError)}
          className={className}
        >
          {children(methods)}
        </form>
      </FormProvider>
    )
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit, onError)}
        className={className}
      >
        {children}
      </form>
    </FormProvider>
  )
}
