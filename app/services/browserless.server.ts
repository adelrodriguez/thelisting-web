import { type Browser, chromium } from "playwright"

import { ONE_MINUTE } from "~/config/consts"
import logger from "~/helpers/logger.server"

const INACTIVITY_THRESHOLD = ONE_MINUTE.inMilliseconds

let browser: Browser | null = null
let lastActiveTime: number
let inactivityCheckInterval: NodeJS.Timeout | null = null

export async function getBrowserInstance(BROWSERLESS_URL: string, BROWSERLESS_TOKEN: string) {
  if (!browser || !browser.isConnected()) {
    logger.info("Creating new browser instance")

    browser = await chromium.connectOverCDP(`${BROWSERLESS_URL}?token=${BROWSERLESS_TOKEN}`)
    startInactivityCheck()
  }

  lastActiveTime = Date.now()
  return browser
}

function startInactivityCheck() {
  inactivityCheckInterval = setInterval(async () => {
    if (Date.now() - lastActiveTime > INACTIVITY_THRESHOLD) {
      if (browser) {
        logger.info("Closing browser due to inactivity")
        await browser.close()
        browser = null
      }
      stopInactivityCheck()
    }
  }, 10000) // Check every 10 seconds
}

function stopInactivityCheck() {
  if (inactivityCheckInterval) {
    clearInterval(inactivityCheckInterval)
    inactivityCheckInterval = null
  }
}
