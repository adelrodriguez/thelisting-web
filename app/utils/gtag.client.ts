declare global {
  interface Window {
    gtag: (
      option: string,
      gaTrackingId: string,
      options: Record<string, unknown>,
    ) => void
  }
}

export const pageview = (
  parameters: { page_path: string } & Record<string, string>,
) => {
  if (!window.gtag) {
    // eslint-disable-next-line no-console
    console.warn(
      "window.gtag is not defined. This could mean your google analytics script has not loaded on the page yet.",
    )
    return
  }

  window.gtag("config", window.env.gaTrackingId, {
    ...parameters,
  })
}

type AnalyticsEvent =
  | "add_note"
  | "add_to_cart"
  | "begin_checkout"
  | "checkout_progress"
  | "login"
  | "purchase"
  | "remove_from_cart"
  | "search"
  | "view_item"

export const event = ({
  action,
  category,
  label,
  value,
  parameters,
}: {
  action: AnalyticsEvent
  category: string
  label?: string
  value?: number
  parameters?: Record<string, unknown>
}) => {
  if (!window.gtag) {
    // eslint-disable-next-line no-console
    console.warn(
      "window.gtag is not defined. This could mean your google analytics script has not loaded on the page yet.",
    )
    return
  }

  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
    ...(parameters || {}),
  })
}
