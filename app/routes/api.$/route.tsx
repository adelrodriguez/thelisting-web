import { notFound } from "~/utils/remix"

export function loader() {
  return notFound({
    message: "The resource you're looking for does not exist.",
    title: "Route not found",
  })
}
