import { setupServer } from "msw/node"

import { alegraHandlers } from "./services/alegra"

// This configures a request mocking server with the given request handlers.
export const server = setupServer(...alegraHandlers)
