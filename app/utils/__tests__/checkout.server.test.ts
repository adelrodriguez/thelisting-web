import { describe, expect, test, vi } from "vitest"

import { calculateFees } from "../checkout.server"

vi.mock("~/helpers/prisma.server")

describe("calculateFees", () => {
  test.each([
    [-0.05, 0.065, "Markup and payment percentages must be above 0%"],
    [0.05, -0.065, "Markup and payment percentages must be above 0%"],
    [
      1.05,
      0.065,
      "Markup and payment fees must be a percentage in decimal form and less than 100%",
    ],
    [
      0.05,
      1.065,
      "Markup and payment fees must be a percentage in decimal form and less than 100%",
    ],
  ])(
    "throws an error if the markup percentage or payment percentage are below 0% or higher than 100%",
    (markupPercentage, paymentPercentage, expected) => {
      const subtotal = 100

      expect(() =>
        calculateFees(subtotal, markupPercentage, paymentPercentage)
      ).toThrowError(expected)
    }
  )

  test.each([
    [0.05, 0.065, 5, 6.83],
    [0.1, 0.05, 10, 5.5],
  ])(
    "calculates the fees correctly: markup %s%, payment %s%",
    (markupPercentage, paymentPercentage, markupFee, paymentFee) => {
      const subtotal = 100

      expect(
        calculateFees(subtotal, markupPercentage, paymentPercentage)
      ).toEqual({
        markupFee,
        paymentFee,
      })
    }
  )
})
