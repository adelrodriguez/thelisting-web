declare module "routes-gen" {
  export type RouteParams = {
    "/": Record<string, never>;
    "/:listingPath": { "listingPath": string };
    "/:listingPath/registry": { "listingPath": string };
    "/:listingPath/registry/:itemSku": { "listingPath": string, "itemSku": string };
    "/:listingPath/registry/cart": { "listingPath": string };
    "/:listingPath/registry/cart/checkout": { "listingPath": string };
    "/:listingPath/registry/cart/confirm": { "listingPath": string };
    "/:listingPath/registry/cart/note": { "listingPath": string };
    "/:listingPath/review": { "listingPath": string };
    "/:listingPath/thank-you": { "listingPath": string };
    "/about": Record<string, never>;
    "/api/admin/listings/:listingId/report.csv": { "listingId": string };
    "/api/cart": Record<string, never>;
    "/api/exchange-rates/:code": { "code": string };
    "/api/images": Record<string, never>;
    "/api/images/:image": { "image": string };
    "/api/scraper/image": Record<string, never>;
    "/api/scraper/product": Record<string, never>;
    "/api/storage": Record<string, never>;
    "/api/storage/:assetId": { "assetId": string };
    "/api/users/:userId/images": { "userId": string };
    "/api/webhooks/meta/whatsapp-bot": Record<string, never>;
    "/api/webhooks/shopify/checkout-updated": Record<string, never>;
    "/api/webhooks/shopify/order-created": Record<string, never>;
    "/api/webhooks/shopify/order-paid": Record<string, never>;
    "/dashboard": Record<string, never>;
    "/dashboard/admin": Record<string, never>;
    "/dashboard/admin/image-scraper": Record<string, never>;
    "/dashboard/admin/jobs": Record<string, never>;
    "/dashboard/admin/manual-jobs": Record<string, never>;
    "/dashboard/admin/product-scraper": Record<string, never>;
    "/dashboard/admin/product-scraper/add-to-listing": Record<string, never>;
    "/dashboard/admin/product-scraper/export-to-csv": Record<string, never>;
    "/dashboard/admin/users": Record<string, never>;
    "/dashboard/admin/users/:userId": { "userId": string };
    "/dashboard/admin/users/new": Record<string, never>;
    "/dashboard/admin/whatsapp-broadcast": Record<string, never>;
    "/dashboard/listings": Record<string, never>;
    "/dashboard/listings/:listingSku": { "listingSku": string };
    "/dashboard/listings/:listingSku/details": { "listingSku": string };
    "/dashboard/listings/:listingSku/details/edit": { "listingSku": string };
    "/dashboard/listings/:listingSku/items": { "listingSku": string };
    "/dashboard/listings/:listingSku/items/:itemSku": { "listingSku": string, "itemSku": string };
    "/dashboard/listings/:listingSku/items/:itemSku/cache": { "listingSku": string, "itemSku": string };
    "/dashboard/listings/:listingSku/items/:itemSku/delete": { "listingSku": string, "itemSku": string };
    "/dashboard/listings/:listingSku/items/new": { "listingSku": string };
    "/dashboard/listings/:listingSku/ribbons": { "listingSku": string };
    "/dashboard/listings/:listingSku/ribbons/:ribbonId": { "listingSku": string, "ribbonId": string };
    "/dashboard/listings/:listingSku/ribbons/new": { "listingSku": string };
    "/dashboard/listings/:listingSku/stats": { "listingSku": string };
    "/dashboard/listings/new": Record<string, never>;
    "/dashboard/settings": Record<string, never>;
    "/health": Record<string, never>;
    "/login": Record<string, never>;
    "/logout": Record<string, never>;
    "/magic": Record<string, never>;
    "/pricing": Record<string, never>;
    "/register": Record<string, never>;
    "/thank-you": Record<string, never>;
  };

  export function route<
    T extends
      | ["/"]
      | ["/:listingPath", RouteParams["/:listingPath"]]
      | ["/:listingPath/registry", RouteParams["/:listingPath/registry"]]
      | ["/:listingPath/registry/:itemSku", RouteParams["/:listingPath/registry/:itemSku"]]
      | ["/:listingPath/registry/cart", RouteParams["/:listingPath/registry/cart"]]
      | ["/:listingPath/registry/cart/checkout", RouteParams["/:listingPath/registry/cart/checkout"]]
      | ["/:listingPath/registry/cart/confirm", RouteParams["/:listingPath/registry/cart/confirm"]]
      | ["/:listingPath/registry/cart/note", RouteParams["/:listingPath/registry/cart/note"]]
      | ["/:listingPath/review", RouteParams["/:listingPath/review"]]
      | ["/:listingPath/thank-you", RouteParams["/:listingPath/thank-you"]]
      | ["/about"]
      | ["/api/admin/listings/:listingId/report.csv", RouteParams["/api/admin/listings/:listingId/report.csv"]]
      | ["/api/cart"]
      | ["/api/exchange-rates/:code", RouteParams["/api/exchange-rates/:code"]]
      | ["/api/images"]
      | ["/api/images/:image", RouteParams["/api/images/:image"]]
      | ["/api/scraper/image"]
      | ["/api/scraper/product"]
      | ["/api/storage"]
      | ["/api/storage/:assetId", RouteParams["/api/storage/:assetId"]]
      | ["/api/users/:userId/images", RouteParams["/api/users/:userId/images"]]
      | ["/api/webhooks/meta/whatsapp-bot"]
      | ["/api/webhooks/shopify/checkout-updated"]
      | ["/api/webhooks/shopify/order-created"]
      | ["/api/webhooks/shopify/order-paid"]
      | ["/dashboard"]
      | ["/dashboard/admin"]
      | ["/dashboard/admin/image-scraper"]
      | ["/dashboard/admin/jobs"]
      | ["/dashboard/admin/manual-jobs"]
      | ["/dashboard/admin/product-scraper"]
      | ["/dashboard/admin/product-scraper/add-to-listing"]
      | ["/dashboard/admin/product-scraper/export-to-csv"]
      | ["/dashboard/admin/users"]
      | ["/dashboard/admin/users/:userId", RouteParams["/dashboard/admin/users/:userId"]]
      | ["/dashboard/admin/users/new"]
      | ["/dashboard/admin/whatsapp-broadcast"]
      | ["/dashboard/listings"]
      | ["/dashboard/listings/:listingSku", RouteParams["/dashboard/listings/:listingSku"]]
      | ["/dashboard/listings/:listingSku/details", RouteParams["/dashboard/listings/:listingSku/details"]]
      | ["/dashboard/listings/:listingSku/details/edit", RouteParams["/dashboard/listings/:listingSku/details/edit"]]
      | ["/dashboard/listings/:listingSku/items", RouteParams["/dashboard/listings/:listingSku/items"]]
      | ["/dashboard/listings/:listingSku/items/:itemSku", RouteParams["/dashboard/listings/:listingSku/items/:itemSku"]]
      | ["/dashboard/listings/:listingSku/items/:itemSku/cache", RouteParams["/dashboard/listings/:listingSku/items/:itemSku/cache"]]
      | ["/dashboard/listings/:listingSku/items/:itemSku/delete", RouteParams["/dashboard/listings/:listingSku/items/:itemSku/delete"]]
      | ["/dashboard/listings/:listingSku/items/new", RouteParams["/dashboard/listings/:listingSku/items/new"]]
      | ["/dashboard/listings/:listingSku/ribbons", RouteParams["/dashboard/listings/:listingSku/ribbons"]]
      | ["/dashboard/listings/:listingSku/ribbons/:ribbonId", RouteParams["/dashboard/listings/:listingSku/ribbons/:ribbonId"]]
      | ["/dashboard/listings/:listingSku/ribbons/new", RouteParams["/dashboard/listings/:listingSku/ribbons/new"]]
      | ["/dashboard/listings/:listingSku/stats", RouteParams["/dashboard/listings/:listingSku/stats"]]
      | ["/dashboard/listings/new"]
      | ["/dashboard/settings"]
      | ["/health"]
      | ["/login"]
      | ["/logout"]
      | ["/magic"]
      | ["/pricing"]
      | ["/register"]
      | ["/thank-you"]
  >(...args: T): typeof args[0];
}
