import type { TypedResponse } from "@remix-run/node"
import { redirect } from "react-router"

export type LoaderResult<T> = Promise<TypedResponse<T>>

export type ErrorBoundaryProps = {
  error: Error
}

export const goBack = () => redirect("..")
