export const isDev = process.env.NODE_ENV !== "production"
export const isProduction = process.env.NODE_ENV === "production"
export const isTest = process.env.NODE_ENV === "test"

export const xStateVisualizer = process.env.XSTATE_VISUALIZER === "true"
