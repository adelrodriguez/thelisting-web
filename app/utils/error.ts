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
      message: "An error ocurred while getting the product",
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

export class AlegraError extends GenericError {
  public apiCode: number | undefined

  constructor(message: string, code: AlegraErrorCode, apiCode?: number) {
    super({
      code,
      message,
      name: "AlegraError",
    })

    this.apiCode = apiCode
  }
}

export class ShopifyError extends GenericError {
  constructor(message: string, code: ShopifyErrorCode) {
    super({
      code,
      message,
      name: "ShopifyError",
    })
  }
}

export type StockErrorCode = "out_of_stock" | "insufficient_stock"

export type ValidationErrorCode = "schema_validation_error"

export type AlegraErrorCode =
  | "get_contact_error"
  | "create_contact_error"
  | "create_invoice_error"
  | "get_currency_error"
  | "send_invoice_error"

export type UserFrameworkErrorCode =
  | "get_users_error"
  | "get_user_error"
  | "create_user_error"
  | "delete_user_error"
  | "update_user_error"

export type ListingFrameworkErrorCode =
  | "get_listings_error"
  | "get_listing_error"
  | "create_listing_error"
  | "delete_listing_error"
  | "update_listing_error"

export type ItemFrameworkErrorCode =
  | "get_items_error"
  | "get_item_error"
  | "create_item_error"
  | "delete_item_error"
  | "update_item_error"

export type ProductErrorCode =
  | "no_product_image"
  | "no_product_price"
  | "no_product_variant"
  | "no_product"
  | "product_id_mismatch"

export type DraftOrderErrorCode = "draft_order_error"

export type PurchaseErrorCode = "no_purchase" | "listing_id_missing"

export type ItemErrorCode = "no_markup" | "no_transaction_fee"

export type GenericErrorCode = "unknown_error" | "no_code_provided"

export type ShopifyErrorCode = "draft_order_create_error" | "order_get_error"

export type FileErrorCode =
  | "no_file_selected"
  | "file_type_not_supported"
  | "file_size_too_large"
  | "unable_to_parse_file"

export type ErrorCode =
  | AlegraErrorCode
  | DraftOrderErrorCode
  | FileErrorCode
  | GenericErrorCode
  | ItemErrorCode
  | ItemFrameworkErrorCode
  | ListingFrameworkErrorCode
  | ProductErrorCode
  | PurchaseErrorCode
  | ShopifyErrorCode
  | StockErrorCode
  | UserFrameworkErrorCode
  | ValidationErrorCode

export type ErrorData = {
  name: string
  message: string
  code: ErrorCode
}

export type ErrorProps = Omit<Partial<ErrorData>, "code"> & {
  code: ErrorCode
  customData?: Record<string, unknown>
}
