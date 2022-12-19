export function cleanAmount(amount?: string | null): number {
  if (!amount) {
    throw new Error("There was no specified amount for this property")
  }

  return parseFloat(amount.replace(/[^0-9.,]/g, "") || "0")
}

export function cleanText(text?: string | null): string {
  if (!text) {
    throw new Error("There was no specified text for this property")
  }

  return text.trim().replaceAll("\n", " ")
}
