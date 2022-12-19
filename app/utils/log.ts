export const logger = {
  error: (message: string, data?: Record<string, unknown>) => {
    console.error(message, data)
  },
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(message, data)
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(message, data)
  },
}
