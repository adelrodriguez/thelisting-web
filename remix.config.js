require("./app/config/env.server.js")

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  future: {
    unstable_tailwind: true,
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
    "react-dnd",
    "@react-dnd/invariant",
    "@react-dnd/shallowequal",
    "dnd-core",
    "@react-dnd/asap",
    "react-dnd-html5-backend",
  ],
}
