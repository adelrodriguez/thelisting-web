export type StockErrorCode = "out_of_stock" | "insufficient_stock"

export type ValidationErrorCode = "schema_validation_error"

export type AlegraAPIErrorCode =
  | "get_currency_error"
  | "create_client_error"
  | "create_invoice_error"

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
  | "no_product"
  | "product_id_mismatch"
  | "no_product_image"
  | "no_product_price_amount"
  | "no_product_price_currency_code"

export type DraftOrderErrorCode = "draft_order_error"

export type PurchaseErrorCode = "no_purchase"

export type ItemErrorCode = "no_markup" | "no_transaction_fee"

export type GenericErrorCode = "unknown_error" | "no_code_provided"

export type FileErrorCode =
  | "no_file_selected"
  | "file_type_not_supported"
  | "file_size_too_large"
  | "unable_to_parse_file"

export type ErrorCode =
  | AlegraAPIErrorCode
  | DraftOrderErrorCode
  | FileErrorCode
  | GenericErrorCode
  | ItemErrorCode
  | ItemFrameworkErrorCode
  | ListingFrameworkErrorCode
  | ProductErrorCode
  | PurchaseErrorCode
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
