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

// Export remix-typedjson
export {
  typedjson as json,
  redirect,
  useTypedActionData as useActionData,
  useTypedFetcher as useFetcher,
  useTypedLoaderData as useLoaderData,
}
