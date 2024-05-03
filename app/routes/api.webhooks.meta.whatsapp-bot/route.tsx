import { type ActionFunctionArgs, type LoaderFunctionArgs, json } from "@remix-run/node"
import { z } from "zod"
import { zx } from "zodix"

import { isProduction } from "~/config/vars"
import { SendSlackMessageQueue } from "~/helpers/queues"
import { unauthorized } from "~/utils/http"
import { verifyWebhook } from "~/utils/webhook.server"

// See: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
// We are currently using Hookdeck to handle the webhooks, so this isn't used at the moment.
export function loader({ request }: LoaderFunctionArgs) {
  const { "hub.challenge": challenge, "hub.verify_token": verifyToken } = zx.parseQuery(
    request,
    z.object({
      "hub.challenge": z.coerce.number(),
      "hub.mode": z.literal("subscribe"),
      "hub.verify_token": z.string(),
    }),
  )

  if (verifyToken !== "388fb937-3f9f-4581-b1d1-701b9d2bbf41") {
    return unauthorized()
  }

  return json(challenge)
}

export async function action({ context, request }: ActionFunctionArgs) {
  const logger = context.logger

  const clone = request.clone()

  const [jsonBody, textBody] = await Promise.all([clone.json(), request.text()])
  const headers = request.headers

  const isVerified = verifyWebhook(headers, textBody, false)

  if (!isVerified) {
    logger.error("Webhook not verified", { headers })

    throw unauthorized({ message: "Webhook not verified" })
  }

  // Currently we don't do anything with the webhook, just log it and send a
  // notification to Slack. Maybe later on we should save it in the database, if
  // we are doing responses.
  logger.info("Received WhatsApp Bot webhook", { body: jsonBody, headers })

  await SendSlackMessageQueue.add("whatsapp-bot-webhook", {
    blocks: [
      {
        text: {
          text: `${isProduction ? ":bell:" : "(Development)"} New WhatsApp Bot webhook received:`,
          type: "mrkdwn",
        },
        type: "section",
      },
      {
        text: {
          text: `\`\`\`${JSON.stringify(jsonBody, null, 2)}\`\`\``,
          type: "mrkdwn",
        },
        type: "section",
      },
    ],
    channel: "notifications-whatsapp-bot",
    text: `New WhatsApp Bot webhook received`,
  })

  return null
}
