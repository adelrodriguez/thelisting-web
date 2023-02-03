import { test, expect } from "vitest"

import { calculatePriceMinusMargin, calculatePricePlusMargin } from "../money"

test("calculatePricePlusMargin", () => {
  expect(calculatePricePlusMargin(100, 10)).toBe(111.11)
})

test("calculatePriceMinusMargin", () => {
  expect(calculatePriceMinusMargin(111.11, 10)).toBe(100)
})
