/* eslint-disable no-console */
export const logger = {
  error: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      console.error(message, data)
    } else {
      console.error(message)
    }
  },
  info: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      console.log(message, data)
    } else {
      console.log(message)
    }
  },
  success: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      console.log(message, data)
    } else {
      console.log(message)
    }
  },
  table: (...args: Parameters<typeof console.table>) => {
    console.table(...args)
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      console.warn(message, data)
    } else {
      console.warn(message)
    }
  },
}
