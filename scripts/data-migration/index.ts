import { spawn } from "node:child_process"
import { Command } from "commander"

const program = new Command()

program
  .description("Run data migration scripts")
  // .option("-d, --dry-run", "Dry run, don't actually change anything")
  .parse()

const script = program.args[0]

const child = spawn("ts-node", [`./scripts/data-migration/${script}`])

child.stdout.setEncoding("utf8")
child.stdout.on("data", (data) => {
  console.log(data.toString())
})

child.stderr.setEncoding("utf8")
child.stderr.on("data", (data) => {
  console.error(data.toString())
})

child.on("error", (error) => {
  console.error("Failed to start subprocess.", error)
})

child.on("close", (code) => {
  console.log(`closing code: ${code}`)
})
