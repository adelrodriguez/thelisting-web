require("./app/config/env.server.js")

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  future: {
    unstable_dev: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
  ignoredRouteFiles: [
    "**/.*",
    "**/__tests__/**",
    "**/*.test.*",
    "**/*.spec.*",
    "**/*.d.ts",
    "**/*.stories.*",
  ],
  serverDependenciesToBundle: [
    "@react-dnd/asap",
    "@react-dnd/invariant",
    "@react-dnd/shallowequal",
    "dnd-core",
    "react-dnd-html5-backend",
    "react-dnd",
  ],
  tailwind: true,
}
