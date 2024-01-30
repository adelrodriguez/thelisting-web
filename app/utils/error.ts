export class GenericError extends Error {
  code: ErrorCode
  customData?: Record<string, unknown>

  constructor({ code, customData, message, name }: ErrorProps) {
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

export type ProductErrorCode =
  | "no_product_image"
  | "no_product_price"
  | "no_product_variant"
  | "no_product"
  | "product_id_mismatch"

export type DraftOrderErrorCode = "draft_order_error"

export type PurchaseErrorCode =
  | "no_purchase"
  | "listing_id_missing"
  | "listing_sku_missing"
  | "session_carts_key_missing"

export type GenericErrorCode = "unknown_error" | "no_code_provided"

export type ShopifyErrorCode =
  | "add_products_to_collection_error"
  | "checkout_create_error"
  | "collection_create_error"
  | "collection_get_error"
  | "order_get_error"
  | "product_create_error"
  | "product_get_error"
  | "product_media_create_error"
  | "product_publish_error"
  | "product_with_metafields_get_error"
  | "remove_products_from_collection_error"
  | "tags_add_error"

export type FileErrorCode =
  | "no_file_selected"
  | "file_type_not_supported"
  | "file_size_too_large"
  | "unable_to_parse_file"

export type ItemErrorCode = "item_not_found"
export type ErrorCode =
  | AlegraErrorCode
  | DraftOrderErrorCode
  | FileErrorCode
  | GenericErrorCode
  | ItemErrorCode
  | ProductErrorCode
  | PurchaseErrorCode
  | ShopifyErrorCode
  | StockErrorCode
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
