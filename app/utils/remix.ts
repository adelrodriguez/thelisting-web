import type { Params } from "@remix-run/react"
import type { TypedMetaFunction, UseDataFunctionReturn } from "remix-typedjson"
import {
  typedjson,
  useTypedActionData,
  useTypedFetcher,
  useTypedLoaderData,
  redirect,
} from "remix-typedjson"
import { badRequest } from "remix-utils"

export type ErrorBoundaryProps = {
  error: Error
}

export const goToParent = () => redirect("..")

export const goHome = () => redirect("/")

export const goToLogin = () => redirect("/login")

export function getParam(
  params: Params<string>,
  key: string,
  errorMessage?: string
) {
  const value = params[key]

  if (!value) {
    if (errorMessage) {
      throw badRequest(errorMessage)
    }

    throw goHome()
  }

  return value
}

// Export remix-typedjson
export {
  typedjson as json,
  redirect,
  useTypedActionData as useActionData,
  useTypedFetcher as useFetcher,
  useTypedLoaderData as useLoaderData,
}
export type { TypedMetaFunction as MetaFunction, UseDataFunctionReturn }
