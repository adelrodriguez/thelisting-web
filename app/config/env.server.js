// This needs to be a JavaScript file to be able to run at build time
require("dotenv").config()
const schema = require("./schema.server.js")

const envs = schema.safeParse(process.env)

const formatErrors = (errors) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value) {
        return `${name}: ${value._errors.join(", ")}\n`
      }

      return null
    })
    .filter(Boolean)

if (!envs.success) {
  // eslint-disable-next-line no-console
  console.error(
    "❌ Invalid environment variables:\n",
    ...formatErrors(envs.error.format())
  )
  throw new Error("You have invalid environment variables.")
}

module.exports = { ...envs.data }
