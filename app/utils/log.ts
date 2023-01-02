/* eslint-disable no-console */
export const logger = {
  error: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      console.error(message, JSON.stringify(data, null, 2))
    } else {
      console.error(message)
    }
  },
  info: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      console.log(message, JSON.stringify(data, null, 2))
    } else {
      console.log(message)
    }
  },
  success: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      console.log(message, JSON.stringify(data, null, 2))
    } else {
      console.log(message)
    }
  },
  table: (...args: Parameters<typeof console.table>) => {
    console.table(...args)
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      console.warn(message, JSON.stringify(data, null, 2))
    } else {
      console.warn(message)
    }
  },
}
