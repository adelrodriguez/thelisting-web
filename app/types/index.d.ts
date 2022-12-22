export {}

declare global {
  interface Window {
    env: {
      xStateVisualizer: boolean
    }
  }
}

declare module "notistack" {
  interface VariantOverrides {
    warning: {
      description?: string
    }
    success: {
      description?: string
    }
    error: {
      description?: string
    }
    info: {
      description?: string
    }
  }
}
