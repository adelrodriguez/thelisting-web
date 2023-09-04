---
inject: true
to: app/helpers/scrapers/product/stores/index.ts
append: true
---
export { default as <%= h.changeCase.pascal(name) %>Scraper } from "./<%= name %>"