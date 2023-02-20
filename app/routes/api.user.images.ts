import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node"
import { badRequest } from "remix-utils"

import auth from "~/helpers/auth.server"
import prisma from "~/helpers/prisma.server"
import { uploadImageToCloudflare } from "~/utils/cloudflare.server"
import { getFormData, Unauthorized } from "~/utils/http.server"

export async function loader({ request }: LoaderArgs) {
  const user = await auth.isAuthenticated(request)

  if (!user) {
    return Unauthorized
  }

  const images = await prisma.image.findMany({
    where: {
      userId: user.id,
    },
  })

  return json(images)
}

export async function action({ request }: ActionArgs) {
  const user = await auth.isAuthenticated(request)

  if (!user) {
    return Unauthorized
  }

  const formData = await getFormData(request)
  const filename = formData.get("filename")

  if (!filename || typeof filename !== "string") {
    throw badRequest("Missing filename")
  }

  const uploadHandler = composeUploadHandlers(async ({ name, data }) => {
    if (name !== "file") {
      return undefined
    }

    const { result } = await uploadImageToCloudflare(data, filename)

    return result.id
  }, createMemoryUploadHandler())

  const multipartFormData = await parseMultipartFormData(request, uploadHandler)

  const fileId = multipartFormData.get("file")

  if (!fileId || typeof fileId !== "string") {
    throw badRequest("Missing filename or image")
  }

  const image = await prisma.image.create({
    data: {
      filename,
      id: fileId,
      userId: user.id,
    },
  })

  return json(image)
}
