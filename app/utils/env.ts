export function assertEnvironmentVariable(
  name: string,
  value: string | undefined
): string {
  if (!value) {
    throw new Error(`The environment variable ${name} is missing`)
  }

  return value
}
