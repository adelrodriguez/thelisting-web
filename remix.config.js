require("./app/config/env.server.js")

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  future: {
    v2_dev: true,
    v2_headers: true,
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
  serverModuleFormat: "cjs",
  serverNodeBuiltinsPolyfill: {
    modules: {},
  },
  tailwind: true,
}
