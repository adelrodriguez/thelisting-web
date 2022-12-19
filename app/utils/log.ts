import chalk from "chalk"

/* eslint-disable no-console */
export const logger = {
  error: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      console.log(chalk.bgRed(message), data)
    } else {
      console.log(message)
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
      console.log(chalk.bgGreen.black(message), data)
    } else {
      console.log(chalk.bgGreen.black(message))
    }
  },
  table: (...args: Parameters<typeof console.table>) => {
    console.table(...args)
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      console.log(chalk.yellow(message), data)
    } else {
      console.log(chalk.yellow(message))
    }
  },
}
