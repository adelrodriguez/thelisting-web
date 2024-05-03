import { StorageService } from "@prisma/client"
import {
  type ActionFunctionArgs,
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  json,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node"
import { v4 as uuid } from "uuid"
import { z } from "zod"
import { zfd } from "zod-form-data"

import auth from "~/helpers/auth.server"
import { createS3UploadHandler } from "~/services/s3.server"
import { badRequest, unauthorized } from "~/utils/http"

const StorageUploadSchema = zfd.formData({
  file: zfd.file(),
  filename: zfd.text(),
  mimeType: zfd.text(),
  name: zfd.text().optional(),
  size: zfd.numeric(z.number().int().positive()),
})

export async function action({ context, request }: ActionFunctionArgs) {
  const db = context.db
  const logger = context.logger
  const env = context.env
  const user = await auth.isAuthenticated(request)

  if (!user) {
    throw unauthorized({
      message: "You must be logged in to upload storage objects",
      title: "Unauthorized",
    })
  }

  const clonedFormData = await request.clone().formData()
  const result = StorageUploadSchema.safeParse(clonedFormData)

  if (!result.success) {
    logger.error("Invalid storage upload request", {
      ...result,
    })

    throw badRequest({
      message: result.error.message,
      title: "Invalid storage upload request",
    })
  }

  // Extract the file extension from the filename
  const re = /(?:\.([^.]+))?$/
  const ext = re.exec(result.data.filename)?.[1]

  // We generate a new filename to avoid collisions
  const filename = uuid() + (ext ? `.${ext}` : "")

  const uploadHandler = composeUploadHandlers(
    createS3UploadHandler({
      contentType: result.data.mimeType,
      key: `${user.id}/${filename}`,
    }),
    createMemoryUploadHandler(),
  )

  const formData = await parseMultipartFormData(request, uploadHandler)
  const url = formData.get("file") as string

  const asset = await db.asset.create({
    data: {
      bucket: env.STORAGE_BUCKET,
      filename,
      mimeType: result.data.mimeType,
      name: result.data.name || result.data.filename,
      service: StorageService.R2,
      size: result.data.size,
      url,
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  })

  return json(asset)
}
