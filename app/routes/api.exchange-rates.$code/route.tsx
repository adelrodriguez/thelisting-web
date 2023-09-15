import { json, type LoaderArgs } from "@remix-run/node"
import { z } from "zod"
import { zx } from "zodix"

import { ONE_HOUR } from "~/config/consts"
import alegra from "~/services/alegra.server"
import { CurrencySchema } from "~/utils/money"
import { generateKey } from "~/utils/redis"

export async function loader({ params, context }: LoaderArgs) {
  const cache = context.cache
  const logger = context.logger

  const { code } = zx.parseParams(params, {
    code: z.preprocess((val) => String(val).toUpperCase(), CurrencySchema),
  })

  const key = generateKey("currency", code)
  const cached = await cache.get(key)
  const result = z.coerce.number().safeParse(cached)

  if (cached && result.success) {
    return json({ exchangeRate: result.data })
  }

  try {
    const currency = await alegra.currencies.get({ code })
    await cache.set(key, currency.exchangeRate, "EX", ONE_HOUR.inSeconds)

    return json({ exchangeRate: currency.exchangeRate })
  } catch (error) {
    logger.error((error as Error).message, { error })

    throw error
  }
}
