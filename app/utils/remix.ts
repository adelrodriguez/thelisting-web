import type { TypedResponse } from "@remix-run/node"

export type LoaderResult<T> = Promise<TypedResponse<T>>

export type ErrorBoundaryProps = {
  error: Error
}
