export type I18nBase = {
  meta: {
    description: string
  }
  common: {
    cancel: string
    close: string
    confirm: string
    currency: string
    options: string
    panel: {
      close: string
      open: string
    }
    menu: {
      close: string
      open: string
    }
    save: string
    saving: string
    submit: string
    submitting: string
    subtotal: string
    total: string
    language: string
    date: string
    error: string
    login: string
    logging_in: string
    logout: string
    language_currency: string
    loading: string
  }
  dashboard: {
    login: {
      welcome: string
      enter_email: string
      magic_link_sent: string
      magic_link_error: string
    }
  }
  listing: {
    registry: string
  }
  registry: {
    add_to_cart: string
    shipping_and_handling: string
    cart: string
    quantity: {
      abbreviation: string
      add: string
      remove: string
      label: string
    }
    shipping_note: string
    add_note_reminder: {
      title: string
      description: string
      confirm: string
      cancel: string
      loading: string
    }
    note: {
      add: string
      added: string

      placeholder: string
      title: string
      subtitle: string
      error: {
        length: string
      }
    }
    checkout: {
      empty: string
      ready: string
      submitting: string
    }
    out_of_stock: string
    item: {
      title: string
      description: string
    }
  }
  thank_you: {
    gift_sent: string
    thank_you: string
    billing_address: string
    confirmation: string
    go_back: string
  }
  review: {
    total_gifted: string
    title: string
    description: string
    empty: string
    items_gifted: string
    view_details: string
    left_you_a_note: string
    gifted_by: string
    gifted_on: string
  }
  marketing: {
    header: {
      about: string
      contact: string
      examples: string
      faq: string
      pricing: string
      features: string
    }
    footer: {
      legal: {
        terms: string
        privacy: string
        refunds: string
        title: string
        security: string
      }
    }
    landing: {
      hero: {
        title: string
        subtitle: string
        cta: string
        find: string
      }
      highlight: {
        title: string
        subtitle: string
        description: string
        features: [
          {
            title: string
            description: string
          },
          {
            title: string
            description: string
          },
          {
            title: string
            description: string
          },
        ]
      }
      features: {
        title: string
        subtitle: string
        description: string
        list: [
          {
            title: string
            description: string
          },
          {
            title: string
            description: string
          },
          {
            title: string
            description: string
          },
          {
            title: string
            description: string
          },
        ]
      }
      contact: {
        title1: string
        title2: string
        contact_us: string
        register: string
      }
    }
    search: {
      placeholder: string
      no_results: {
        title: string
        subtitle: string
      }
    }
  }
}
