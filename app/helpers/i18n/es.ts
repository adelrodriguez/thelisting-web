import { I18nBase } from "~/helpers/i18n/base"

const es: I18nBase = {
  common: {
    cancel: "Cancelar",
    close: "Cerrar",
    confirm: "Confirmar",
    currency: "Moneda",
    date: "Fecha",
    error: "Error",
    language: "Idioma",
    language_currency: "Idioma y moneda",
    loading: "Cargando...",
    logging_in: "Iniciando sesión...",
    login: "Iniciar sesión",
    logout: "Cerrar sesión",
    menu: {
      close: "Cerrar menú",
      open: "Abrir menú",
    },
    options: "Opciones",
    panel: {
      close: "Cerrar panel",
      open: "Abrir panel",
    },
    save: "Guardar",
    saving: "Guardando...",
    submit: "Enviar",
    submitting: "Enviando...",
    subtotal: "Subtotal",
    total: "Total",
  },
  dashboard: {
    login: {
      enter_email: "Ingresa tu correo electrónico",
      magic_link_error:
        "No podemos encontrar una cuenta con ese email. Por favor, comuníquese con el administrador para crear una cuenta.",
      magic_link_sent:
        "Te hemos enviado un enlace mágico a tu email. Por favor revisa tu bandeja de entrada.",
      welcome: "Bienvenidos a The Listing.",
    },
  },
  listing: {
    registry: "Lista de regalos",
  },
  marketing: {
    footer: {
      legal: {
        privacy: "Política de privacidad",
        refunds: "Política de reembolso",
        security: "Política de seguridad",
        terms: "Términos y condiciones",
        title: "Legal",
      },
    },
    header: {
      about: "Nosotros",
      contact: "Contacto",
      examples: "Ejemplos",
      faq: "Preguntas",
      features: "Características",
      pricing: "Planes",
    },
    landing: {
      contact: {
        contact_us: "Contáctanos",
        register: "Regístrate",
        title1: "¿Tienes alguna pregunta?",
        title2: "¡Contáctanos!",
      },
      features: {
        title: "Características",
      },
      hero: {
        cta: "Crea tu lista",
        find: "Busca una lista",
        subtitle:
          "Crea tu lista de regalos con artículos de diferentes tiendas para tu momento más importante",
        title: "Todo lo que deseas, en una sola lista",
      },
    },
    search: {
      no_results: {
        subtitle:
          "Parece que no hay listas con ese nombre. Intenta buscar con otro nombre o contacta al dueño de la lista.",
        title: "No encontramos resultados",
      },
      placeholder: "Busca una lista",
    },
  },
  meta: {
    description:
      "Listas de regalo y experiencias personalizadas para todo tipo de eventos. Te permitimos elegir artículos de cualquier tienda que desees.",
  },
  registry: {
    add_note_reminder: {
      cancel: "Ir a pagar 🎁",
      confirm: "Agregar un mensaje ✨",
      description:
        "Vemos que no has dejado un mensaje personalizado para tu regalo. ¿Deseas agregar uno?",
      loading: "Preparando...",
      title: "Tu regalo no tiene mensaje 👀",
    },
    add_to_cart: "Agregar a tu compra 🛍",
    cart: "Tu compra 🛍",
    checkout: {
      empty: "No has agregado regalos",
      ready: "Listo para regalar 🎁",
      submitting: "Preparando tu compra...",
    },
    item: {
      description: "Descripción del artículo",
      title: "Información del artículo",
    },
    note: {
      add: "✨ Agrega un mensaje especial a tu regalo ✨",
      added: "¡Mensaje agregado! ✨ Haz click aquí para cambiarlo",
      error: {
        length: "El mensaje debe tener entre 1 y 500 caracteres",
      },
      placeholder: "Escribe tu mensaje aquí...",
      subtitle:
        "Tu mensaje sera enviado al destinatario cuando la orden sea procesada",
      title: "Añade un mensaje personalizado a tu regalo",
    },
    out_of_stock: "Regalado ✨",
    quantity: {
      abbreviation: "Cant.",
      add: "Agregar",
      label: "Cantidad",
      remove: "Eliminar",
    },
    shipping_and_handling: "Gestión y entrega",
    shipping_note:
      "El valor de los artículos se enviará a los dueños de la lista.",
  },
  review: {
    description:
      "Aquí puedes ver los regalos que has recibido y los mensajes que te han dejado.",
    empty: "Todavía no has recibido ningún regalo.",
    gifted_by: "Regalado por",
    gifted_on: "Regalado el",
    items_gifted: "Artículos regalados",
    left_you_a_note: "{{name}} te dejó un mensaje:",
    title: "Tus regalos",
    total_gifted: "Total regalado",
    view_details: "Ver detalles",
  },
  thank_you: {
    billing_address: "Dirección de facturación",
    confirmation:
      "Tu regalo será enviado con mucho amor. Te enviaremos un correo con la factura de gestión y entrega.",
    gift_sent: "Regalo enviado",
    go_back: "Volver a la lista",
    thank_you: "¡Gracias por tu regalo, {{name}}! ✨",
  },
}

export default es
