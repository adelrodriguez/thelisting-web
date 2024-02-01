import { I18nBase } from "~/helpers/i18n/base"

const en: I18nBase = {
  common: {
    cancel: "Cancel",
    close: "Close",
    confirm: "Confirm",
    currency: "Currency",
    date: "Date",
    error: "Error",
    language: "Language",
    language_and_currency: "Language and Currency",
    loading: "Loading...",
    logging_in: "Logging in...",
    login: "Log in",
    logout: "Log out",
    options: "Options",
    panel: {
      close: "Close panel",
      open: "Open panel",
    },
    save: "Save",
    saving: "Saving...",
    submit: "Submit",
    submitting: "Submitting...",
    subtotal: "Subtotal",
    total: "Total",
  },
  dashboard: {
    login: {
      enter_email: "Enter your email",
      magic_link_error:
        "We cannot find an account with that email. Please, contact the administrator to create an account.",
      magic_link_sent:
        "We have sent you a magic link to your email. Please check your inbox.",
      welcome: "Welcome to The Listing.",
    },
  },
  listing: {
    registry: "Gift List",
  },
  marketing: {
    features: {
      title: "Features",
    },
    header: {
      examples: "Examples",
    },
    hero: {
      cta: "Create your list",
      find: "Find a list",
      subtitle:
        "Create your gift list with items from different stores for your most important moment",
      title: "Everything you want, in one list",
    },
  },
  registry: {
    add_note_reminder: {
      cancel: "Go to checkout 🎁",
      confirm: "Add a message ✨",
      description:
        "We see that you have not left a personalized message for your gift. Would you like to add one?",
      loading: "Preparing...",
      title: "Your gift has no message 👀",
    },
    add_to_cart: "Add to gifts 🛍",
    cart: "Your gift bag 🛍",
    checkout: {
      empty: "You have not added any gifts",
      ready: "Ready to gift 🎁",
      submitting: "Preparing your purchase...",
    },
    item: {
      description: "Item description",
      title: "Item information",
    },
    note: {
      add: "✨ Add a special message to your gift ✨",
      added: "Message added! ✨ Click here to change it",
      error: {
        length: "The message must be between 1 and 500 characters",
      },
      placeholder: "Write your message here...",
      subtitle:
        "Your message will be sent to the recipient when the order is processed",
      title: "Add a personalized message to your gift",
    },
    out_of_stock: "Gifted ✨",
    quantity: {
      abbreviation: "Qty.",
      add: "Add",
      label: "Quantity",
      remove: "Remove",
    },
    shipping_and_handling: "Handling and Delivery",
    shipping_note:
      "The value of the items will be sent to the owners of the list.",
  },
  review: {
    description:
      "Here you can see the gifts you've received and the messages left for you.",
    empty: "You have not received any gifts yet.",
    gifted_by: "Gifted by",
    gifted_on: "Gifted on",
    items_gifted: "Gifted Items",
    left_you_a_note: "{{name}} left you a message:",
    title: "Your gifts",
    total_gifted: "Total Gifted",
    view_details: "View details",
  },
  thank_you: {
    billing_address: "Billing Address",
    confirmation:
      "Your gift will be sent with a lot of love. We will send you an email with the management and delivery invoice.",
    gift_sent: "Gift Sent",
    go_back: "Go back to the registry",
    thank_you: "Thank you for your gift, {{name}}! ✨",
  },
}

export default en
