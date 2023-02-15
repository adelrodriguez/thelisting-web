import { test, expect } from "vitest"

import { calculatePriceMinusMargin, calculatePriceWithMargin } from "../money"

test("calculatePriceWithMargin", () => {
  expect(calculatePriceWithMargin(100, 10)).toBe(111.11)
})

test("calculatePriceMinusMargin", () => {
  expect(calculatePriceMinusMargin(111.11, 10)).toBe(100)
})
