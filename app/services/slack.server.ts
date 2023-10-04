import { WebClient } from "@slack/web-api"

import { SLACK_WEB_TOKEN } from "~/config/env.server"

const slack = new WebClient(SLACK_WEB_TOKEN)

export default slack
