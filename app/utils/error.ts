import type {
  ErrorData,
  ErrorProps,
  ErrorCode,
  ProductErrorCode,
  StockErrorCode,
  FileErrorCode,
} from "~/types/error"

export class GenericError extends Error {
  code: ErrorCode
  customData?: Record<string, unknown>

  constructor({ message, code, customData, name }: ErrorProps) {
    const defaultError: ErrorData = {
      code: "no_code_provided",
      message: "No error message provided",
      name: "GenericError",
    }

    const error: ErrorData = message
      ? // If there's a message, provide message, code and name
        { code, message, name: name || defaultError.name }
      : // If there's no error provided, provide the default
        defaultError

    super(error.message || defaultError.message)
    this.name = error.name || defaultError.name
    this.customData = customData
    this.code = error.code
  }
}

export class UnknownError extends GenericError {
  constructor(message: string, customData?: Record<string, unknown>) {
    super({
      code: "unknown_error",
      customData,
      message,
      name: "UnknownError",
    })
  }
}

export class StockError extends GenericError {
  constructor(code: StockErrorCode) {
    super({
      code,
      message: "Not enough stock to purchase this item",
      name: "StockError",
    })
  }
}

export class FileError extends GenericError {
  constructor(message: string, code: FileErrorCode) {
    super({
      code,
      message,
      name: "FileError",
    })
  }
}

export class ProductError extends GenericError {
  constructor(code: ProductErrorCode) {
    super({
      code,
      message: "An error ocurred while associating the product",
      name: "ProductError",
    })
  }
}

export class SchemaValidationError extends GenericError {
  constructor(message: string) {
    super({
      code: "schema_validation_error",
      message,
      name: "SchemaValidationError",
    })
  }
}

export class AlegraAPIError extends GenericError {
  public apiCode: number | undefined

  constructor(message: string, code: ErrorCode, apiCode?: number) {
    super({
      code,
      message,
      name: "AlegraAPIError",
    })

    this.apiCode = apiCode
  }
}
