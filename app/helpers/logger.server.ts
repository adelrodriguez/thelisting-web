import { WinstonTransport as AxiomTransport } from "@axiomhq/winston"
import { createLogger, transports, addColors, format } from "winston"

import { isDevelopment } from "~/config/vars"

// Define different colors for each level. Colors make the log message more
// visible, adding the ability to focus or ignore messages.
const colors = {
  debug: "white",
  error: "red",
  http: "magenta",
  info: "green",
  warn: "yellow",
}

// Tell winston that you want to link the colors defined above to the severity
// levels.
addColors(colors)

// Create the logger instance that has to be exported and used to log messages.
const logger = createLogger({
  // Chose the aspect of your log customizing the log format.
  format: format.combine(
    // Add the message timestamp with the preferred format
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    // Tell Winston that the logs must be colored
    format.colorize({ all: true })
  ),

  level: isDevelopment ? "silly" : "http",

  // Define which transports the logger must use to print out messages. We are
  // using three different transports.
  transports: [
    // Allow the use the console to print the messages. If the server is run in
    // development, we want to print the log in a simple format, otherwise, if
    // it is run in production, we want to print the log in JSON format.
    isDevelopment
      ? new transports.Console({ format: format.simple() })
      : new transports.Console({ format: format.json() }),

    new AxiomTransport(),
  ],
})

export default logger
