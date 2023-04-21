import type { TypedMetaFunction, UseDataFunctionReturn } from "remix-typedjson"
import {
  typedjson,
  useTypedActionData,
  useTypedFetcher,
  useTypedLoaderData,
  redirect,
} from "remix-typedjson"

export type ErrorBoundaryProps = {
  error: Error
}

export const goToParent = () => redirect("..")

export const goHome = () => redirect("/")

export const goToLogin = () => redirect("/login")

// Export remix-typedjson
export {
  typedjson as json,
  redirect,
  useTypedActionData as useActionData,
  useTypedFetcher as useFetcher,
  useTypedLoaderData as useLoaderData,
}
export type { TypedMetaFunction as MetaFunction, UseDataFunctionReturn }
