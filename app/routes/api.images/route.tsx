import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  json,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node"
import { ReasonPhrases, StatusCodes } from "http-status-codes"

import auth from "~/helpers/auth.server"
import { uploadImageToCloudflare } from "~/utils/cloudflare.server"

export async function loader({ context, request }: LoaderFunctionArgs) {
  const db = context.db
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw json(
      { message: "You must be logged in to view images" },
      {
        status: StatusCodes.UNAUTHORIZED,
        statusText: ReasonPhrases.UNAUTHORIZED,
      },
    )
  }

  const images = await db.image.findMany({
    where: {
      userId: user.id,
    },
  })

  return json(images)
}

export async function action({ context, request }: ActionFunctionArgs) {
  const db = context.db
  const user = await auth.isAuthenticated(request)

  if (!user) {
    return json(
      { message: "You must be logged in to upload images" },
      {
        status: StatusCodes.UNAUTHORIZED,
        statusText: ReasonPhrases.UNAUTHORIZED,
      },
    )
  }

  const formData = await request.clone().formData()
  const filename = formData.get("filename")

  if (!filename || typeof filename !== "string") {
    throw json(
      { message: "Missing filename" },
      {
        status: StatusCodes.BAD_REQUEST,
        statusText: ReasonPhrases.BAD_REQUEST,
      },
    )
  }

  const uploadHandler = composeUploadHandlers(async ({ data, name }) => {
    if (name !== "file") {
      return undefined
    }

    const { result } = await uploadImageToCloudflare(data, filename)

    return result.id
  }, createMemoryUploadHandler())

  const multipartFormData = await parseMultipartFormData(request, uploadHandler)

  const fileId = multipartFormData.get("file")

  if (!fileId || typeof fileId !== "string") {
    throw json(
      { message: "Missing image" },
      {
        status: StatusCodes.BAD_REQUEST,
        statusText: ReasonPhrases.BAD_REQUEST,
      },
    )
  }

  const image = await db.image.create({
    data: {
      filename,
      id: fileId,
      userId: user.id,
    },
  })

  return json(image)
}
