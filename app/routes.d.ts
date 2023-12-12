declare module "routes-gen" {
  export type RouteParams = {
    "/": Record<string, never>;
    "/:listing": { "listing": string };
    "/:listing/:item": { "listing": string, "item": string };
    "/:listing/cart": { "listing": string };
    "/:listing/cart/checkout": { "listing": string };
    "/:listing/cart/confirm": { "listing": string };
    "/:listing/cart/note": { "listing": string };
    "/:listing/page": { "listing": string };
    "/:listing/review": { "listing": string };
    "/:listing/thank-you": { "listing": string };
    "/about": Record<string, never>;
    "/api/admin/listings/:listingId/report.csv": { "listingId": string };
    "/api/cart": Record<string, never>;
    "/api/exchange-rates/:code": { "code": string };
    "/api/images": Record<string, never>;
    "/api/images/:image": { "image": string };
    "/api/ribbons/:ribbonId": { "ribbonId": string };
    "/api/scraper/image": Record<string, never>;
    "/api/scraper/product": Record<string, never>;
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
    "/dashboard/listings/:listingSku/edit": { "listingSku": string };
    "/dashboard/listings/:listingSku/items": { "listingSku": string };
    "/dashboard/listings/:listingSku/items/:itemSku": { "listingSku": string, "itemSku": string };
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
      | ["/:listing", RouteParams["/:listing"]]
      | ["/:listing/:item", RouteParams["/:listing/:item"]]
      | ["/:listing/cart", RouteParams["/:listing/cart"]]
      | ["/:listing/cart/checkout", RouteParams["/:listing/cart/checkout"]]
      | ["/:listing/cart/confirm", RouteParams["/:listing/cart/confirm"]]
      | ["/:listing/cart/note", RouteParams["/:listing/cart/note"]]
      | ["/:listing/page", RouteParams["/:listing/page"]]
      | ["/:listing/review", RouteParams["/:listing/review"]]
      | ["/:listing/thank-you", RouteParams["/:listing/thank-you"]]
      | ["/about"]
      | ["/api/admin/listings/:listingId/report.csv", RouteParams["/api/admin/listings/:listingId/report.csv"]]
      | ["/api/cart"]
      | ["/api/exchange-rates/:code", RouteParams["/api/exchange-rates/:code"]]
      | ["/api/images"]
      | ["/api/images/:image", RouteParams["/api/images/:image"]]
      | ["/api/ribbons/:ribbonId", RouteParams["/api/ribbons/:ribbonId"]]
      | ["/api/scraper/image"]
      | ["/api/scraper/product"]
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
      | ["/dashboard/listings/:listingSku/edit", RouteParams["/dashboard/listings/:listingSku/edit"]]
      | ["/dashboard/listings/:listingSku/items", RouteParams["/dashboard/listings/:listingSku/items"]]
      | ["/dashboard/listings/:listingSku/items/:itemSku", RouteParams["/dashboard/listings/:listingSku/items/:itemSku"]]
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
