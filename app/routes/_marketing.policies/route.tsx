import { Link } from "@remix-run/react"

export default function Page() {
  return (
    <div className="flex flex-col gap-y-16 px-16 py-36 md:p-36">
      <section className="flex flex-col gap-y-8 text-center">
        <h1 className="font-headline text-4xl font-black">
          Políticas y Términos del Servicio
        </h1>
        <div className="flex flex-col gap-y-4">
          <p>
            ¡Muchas gracias por elegir a <strong>The Listing</strong> como su
            gestor de listas de regalos!
          </p>
          <p>
            Estamos muy agradecidos de poder acompañarlos durante su evento; y,
            antes que nada, estamos 100% comprometidos con darle un excelente
            servicio personalizado que satisfaga sus expectativas y asegurando
            la integridad de su información.
          </p>
          <p>
            A continuación, presentamos los Términos y Condiciones y las
            Políticas que rigen nuestro servicio Es muy importante para nosotros
            que los lean con detenimiento y ante cualquier aclaración, no duden
            en contactarnos.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-y-8">
        <h2 className="text-center font-heading text-3xl font-bold" id="#terms">
          Términos y Condiciones
        </h2>
        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-4">
          <h3 className="py-4 font-headline text-2xl font-bold">
            Generales del Servicio
          </h3>
          <div className="col-span-3 flex flex-col gap-y-4">
            <p>
              The Listing ofrece el servicio de gestión de listas de regalos
              para cualquier tipo de evento, teniendo como ventaja el poder
              colocar como artículos de la misma, productos que no sean de una
              misma tienda y la opción de experiencias a través de la comodidad
              de pagos con tarjetas de crédito.
            </p>

            <h4 className="text-lg font-bold">
              Responsabilidades de The Listing
            </h4>
            <ul className="ml-4 list-disc">
              <li>
                Diseñar y habilitar pagina web de su evento (enlace único)
              </li>
              <li>
                Habilitar compra de regalos a través de la pagina web del evento
              </li>
              <li>
                Realizar la gestión de compra y entrega física de los regalos
                comprados
              </li>
              <li>
                Entrega de los artículos comprados a la dirección provista por
                el cliente.
              </li>
            </ul>

            <h4 className="text-lg font-bold">Responsabilidades del Cliente</h4>
            <ul className="ml-4 list-disc">
              <li>Proveer las informaciones para el registro como cliente</li>
              <li>Proveer las informaciones para el diseño de la página web</li>
              <li>
                Seleccionar, de acuerdo con la metodología correspondiente, los
                artículos que irán en la lista de regalos
              </li>
            </ul>

            <h4 className="text-lg font-bold">
              Características de las Listas de Regalo
            </h4>
            <h5 className="font-bold">Activación de la Lista</h5>
            <p>
              Luego de recibir los formularios de registro y de artículos
              completado por usted, la lista estará disponible dentro de 3 días
              laborables.
            </p>

            <h5 className="font-bold">
              Realización de Cambios de Formato a la Lista
            </h5>
            <p>
              Puede solicitar cambios en el formato de la lista en cualquier
              momento a través de los canales de comunicación. Los cambios
              tienen un tiempo de implementación de 1 a 2 días, según la
              complejidad de los mismos.
            </p>

            <h5 className="font-bold">Disponibilidad de la Lista</h5>
            <p>
              Las listas (enlace web) estarán disponibles por 3 meses
              considerando la fecha del evento. El cliente puede elegir la fecha
              en que desea se habilite.
            </p>

            <h5 className="font-bold">Compra de Artículos de la Lista</h5>
            <p>
              Inmediatamente se realice la compra de un articulo de la lista, se
              asumirá como bueno y valido la compra física del mismo en la
              tienda, a menos que se haya acordado distinto previamente con el
              cliente.
            </p>

            <h5 className="font-bold">
              Tiempos de Entrega de Artículos Comprados
            </h5>
            <p>
              Semanalmente se realizarán compras físicas de los artículos
              comprados en las listas. Las entregas de los artículos se
              realizarán cuando exista una cantidad significativa de artículos
              comprados en coordinación con el cliente.
            </p>

            <h5 className="font-bold">Entregas de Artículos Comprados</h5>
            <p>
              Se procederá con la entrega de los artículos comprados con previa
              coordinación con el cliente.
            </p>

            <h5 className="font-bold">Entregas fuera del Distrito Nacional</h5>
            <p>
              Las entregas dentro del Distrito Nacional están incluidas como
              parte del servicio. Las entregas fuera del Distrito Nacional
              tienen un costo adicional, que dependerá de la distancia desde el
              DN, y deberá ser pagado previo a la activación de la lista.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-4">
          <h3 className="py-4 font-headline text-2xl font-bold">
            Manejo de Artículos de la Lista
          </h3>

          <div className="col-span-3 flex flex-col gap-y-4">
            <h4 className="text-lg font-bold">Compra de Artículos:</h4>
            <p>
              Serán adquiridos exactamente los artículos identificados por el
              cliente considerando lo siguiente:
            </p>
            <ul className="ml-4 list-disc">
              <li>
                En caso de no haber del color elegido en existencia, se
                procederá con la compra del color disponible, exceptuando ropa y
                artículos personales para los cuales se consultará con el
                cliente.
              </li>
              <li>
                En caso de que el articulo no este disponible al momento de la
                compra, se procederá a contactar al cliente para definir un
                articulo sustituto.
              </li>
              <li>
                En caso de que el articulo haya subido de precio, se consultará
                con el cliente si desea adquirirlo, considerando que deberá
                asumir la diferencia en el precio, o hacer una sustitución de
                articulo.
              </li>
            </ul>

            <h4 className="text-lg font-bold">Artículos de Alto Valor:</h4>
            <p>
              Los artículos de alto valor (por ej. neveras, estufas, comedores,
              etc.) se comprarán en las tiendas correspondientes a nombre del
              cliente para asegurar la garantía y serán entregadas de acuerdo
              con la política de la tienda. En caso de que el transporte del
              articulo requiera de un costo adicional, el mismo deberá ser
              asumido por el cliente.
            </p>

            <h4 className="text-lg font-bold">
              Cambios de Artículos en la lista:
            </h4>
            <p>
              Los cambios en los artículos se manejarán de la siguiente manera:
            </p>
            <ul className="ml-4 list-disc">
              <li>
                Se podrán eliminar y/o cambiar aquellos artículos que todavía no
                hayan sido comprados.
              </li>
              <li>
                Se podrán agregar nuevos artículos a la lista en cualquier
                momento, enviando el formulario correspondiente por los canales
                de comunicación definidos.
              </li>
              <li>
                No se podrán cambiar, eliminar ni ajustar aquellos artículos que
                ya hayan sido comprados en la lista.
              </li>
            </ul>

            <h4 className="text-lg font-bold">
              Artículos de Tiendas Internacionales
            </h4>
            <p>
              De acuerdo al Plan de Servicio seleccionado, tendrá la opción de
              colocar artículos de tiendas internacionales (Amazon, Ebay, etc.).
              Estos artículos serán colocados en su lista considerando:
            </p>
            <ul className="ml-4 list-disc">
              <li>
                El precio del articulo sera el mismo precio en pesos + el costo
                del shipping + costo del courier considerando la tasa del dólar
                del día.
              </li>
              <li>
                Si tiene una gran cantidad de artículos de fuera comprados en su
                lista, podemos asesorarle en el servicio de cajas para traerlos
                todos con mayor comodidad.
              </li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-4">
          <h3 className="py-4 font-headline text-2xl font-bold">
            Garantía y Devoluciones
          </h3>

          <div className="col-span-3">
            <p>
              Las garantías de los artículos comprados deberán gestionarse
              directamente con las tiendas correspondientes. The Listing
              realizará la compra de estos a nombre del cliente para su
              comodidad y facilidad, sin embargo, en caso de que exista la
              necesidad de realizar un reclamo por garantía y/o una devolución,
              la misma deberá hacerla el cliente directamente. The Listing no se
              hace responsable de la garantía de los artículos comprados luego
              de la entrega de estos al cliente.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-4">
          <h3 className="py-4 font-headline text-2xl font-bold">
            Compra de Regalos de sus Invitados
          </h3>
          <div className="col-span-3">
            <p>
              Sus invitados podrán comprar los artículos que deseen regalarles a
              través de su página web personalizada y tendrán la opción de pago
              con tarjeta de crédito a través de la plataforma AZUL o a través
              de transferencia bancaria si se desea.
            </p>

            <p>
              Al momento de hacer la orden, se incluye un costo de 7.5% por pago
              con tarjeta y un fee por gestión de transporte y entrega de
              RD$300. Este monto es transparentando al momento de la emisión de
              la factura al cliente (invitado).
            </p>

            <p>
              Al momento de completarse la orden, usted recibirá una
              notificación automatica por Whatsapp con el detalle de los regalos
              comprados, mensaje de su invitado y el total acumulado.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-y-8">
        <h2
          className="text-center font-heading text-3xl font-bold"
          id="refunds"
        >
          Política de Reembolso y Cancelación
        </h2>
        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-4">
          <h3 className="py-4 font-headline text-2xl font-bold">
            Reembolsos y Cancelaciones de Compras
          </h3>
          <div className="col-span-3 flex flex-col gap-y-4">
            <p>
              Por la naturaleza del servicio que brinda The Listing SRL, no
              admitimos reembolsos o cancelación de ordenes una vez colocadas.
            </p>

            <p>
              Si desea realizar un cambio y/o ajuste al servicio o regalo
              comprado, comuníquese con nosotros a través de nuestros canales de
              comunicación.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-y-8">
        <h2
          className="text-center font-heading text-3xl font-bold"
          id="security"
        >
          Política de la Seguridad de la Transmisión de Datos
        </h2>

        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-4">
          <h3 className="py-4 font-headline text-2xl font-bold">
            Transmisión de Datos de Tarjetas
          </h3>

          <div className="col-span-3 flex flex-col gap-y-4">
            <h4 className="text-lg font-bold">Website</h4>
            <p>
              Tomamos todas las medidas y precauciones razonables para proteger
              tu información personal y seguimos las mejores prácticas de la
              industria para asegurar que tu información no sea utilizada de
              manera inapropiada, alterada o destruida. Ciframos la información
              de tu tarjeta de crédito utilizando la tecnología de capa de
              puertos seguros o Secure Sockets Layer (SSL), y la almacenamos con
              el cifrado AES-256. También, seguimos todos los requerimientos del
              PCI-DSS.
            </p>

            <h4 className="text-lg font-bold">Pagos</h4>
            <p>
              Los métodos de pago utilizados por LA EMPRESA son servicios de
              terceros. Estos servicios de terceros (AZUL), cumplen con todos
              los estándares de seguridad y cifrado para mantener tu información
              segura. Solo utilizarán la información necesaria para completar el
              proceso requerido. También recomendamos leer las Políticas de
              Privacidad de estos proveedores, para entender mejor cómo manejan
              la información suministrada.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-y-8">
        <h2
          className="text-center font-heading text-3xl font-bold"
          id="privacy"
        >
          Política de Privacidad
        </h2>

        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-4">
          <h3 className="py-4 font-headline text-2xl font-bold">Privacidad</h3>

          <div className="col-span-3 flex flex-col gap-y-4">
            <p>
              Esta Política de privacidad describe cómo se recopila, usa y
              comparte su información personal cuando visita o realiza una
              compra en www.thelisting.do (el &quot;Sitio&quot;).
            </p>

            <h4 className="text-lg font-bold">
              Información personal que recopilamos
            </h4>
            <p>
              Cuando visita el Sitio, recopilamos automáticamente cierta
              información sobre su dispositivo, incluida información sobre su
              navegador web, dirección IP, zona horaria y algunas de las cookies
              que están instaladas en su dispositivo. Además, a medida que
              navega por el Sitio, recopilamos información sobre las páginas web
              individuales o los productos que ve, qué sitios web o términos de
              búsqueda lo remitieron al Sitio e información sobre cómo
              interactúa con el Sitio. Nos referimos a esta información
              recopilada automáticamente como &quot;Información del
              dispositivo&quot;.
            </p>

            <p>
              Recopilamos información del dispositivo utilizando las siguientes
              tecnologías:
            </p>
            <ul className="ml-4 list-disc">
              <li>
                Las &quot;cookies&quot; son archivos de datos que se colocan en
                su dispositivo o computadora y, a menudo, incluyen un
                identificador único anónimo. Para obtener más información sobre
                las cookies y cómo deshabilitarlas, visite
                http://www.allaboutcookies.org.
              </li>
              <li>
                Los &quot;archivos de registro&quot; rastrean las acciones que
                ocurren en el Sitio y recopilan datos, incluida su dirección IP,
                tipo de navegador, proveedor de servicios de Internet, páginas
                de referencia/salida y sellos de fecha/hora.
              </li>
              <li>
                Las &quot;balizas web&quot;, las &quot;etiquetas&quot; y los
                &quot;píxeles&quot; son archivos electrónicos que se utilizan
                para registrar información sobre cómo navega por el Sitio.
              </li>
            </ul>

            <p>
              Además, cuando realiza una compra o intenta realizar una compra a
              través del Sitio, recopilamos cierta información sobre usted,
              incluido su nombre, dirección de facturación, dirección de envío,
              información de pago (incluidos los números de tarjeta de crédito),
              dirección de correo electrónico y número de teléfono. Nos
              referimos a esta información como &quot;Información del
              pedido&quot;.
            </p>

            <p>
              Cuando hablamos de &quot;Información personal&quot; en esta
              Política de privacidad, nos referimos tanto a la Información del
              dispositivo como a la Información del pedido.
            </p>

            <h4 className="text-lg font-bold">
              ¿CÓMO USAMOS TU INFORMACIÓN PERSONAL?
            </h4>
            <p>
              Utilizamos la Información de pedido que recopilamos generalmente
              para cumplir con cualquier pedido realizado a través del Sitio
              (incluido el procesamiento de su información de pago, la
              organización del envío si es necesario y el envío de facturas y/o
              confirmaciones de pedidos). Además, utilizamos esta información de
              pedido para:
            </p>
            <ul className="ml-4 list-disc">
              <li>Comunicarse con usted;</li>
              <li>
                Revisar nuestros pedidos en busca de riesgo potencial o fraude;
                y
              </li>
              <li>
                Cuando esté en línea con las preferencias que ha compartido con
                nosotros, proporcionarle información o publicidad relacionada
                con nuestros productos o servicios.
              </li>
            </ul>

            <p>
              Usamos la información del dispositivo que recopilamos para
              ayudarnos a detectar posibles riesgos y fraudes (en particular, su
              dirección IP) y, en general, para mejorar y optimizar nuestro
              sitio (por ejemplo, al generar análisis sobre cómo nuestros
              clientes navegan e interactúan con el Sitio, y para evaluar el
              éxito de nuestras campañas de marketing y publicidad).
            </p>

            <h4 className="text-lg font-bold">
              Compartiendo su Información Personal
            </h4>
            <p>
              Compartimos su información personal con terceros para ayudarnos a
              usar su información personal, como se describe anteriormente. Por
              ejemplo, usamos Shopify para impulsar nuestra tienda en línea;
              puede leer más sobre cómo Shopify usa su información personal
              aquí: https://www.shopify.com/legal/privacy. También usamos Google
              Analytics para ayudarnos a comprender cómo nuestros clientes usan
              el Sitio; puede leer más sobre cómo Google usa su información
              personal aquí: https://www.google.com/intl/en/policies/privacy/.
              También puede darse de baja de Google Analytics aquí:
              https://tools.google.com/dlpage/gaoptout.
            </p>

            <p>
              Finalmente, también podemos compartir su información personal para
              cumplir con las leyes y regulaciones aplicables, para responder a
              una citación, orden de allanamiento u otra solicitud legal de
              información que recibamos, o para proteger nuestros derechos.
            </p>

            <h4 className="text-lg font-bold">No Seguir</h4>
            <p>
              Tenga en cuenta que no alteramos las prácticas de uso y
              recopilación de datos de nuestro Sitio cuando vemos una señal de
              No rastrear de su navegador.
            </p>

            <h4 className="text-lg font-bold">Tus Derechos</h4>
            <p>
              Si es residente europeo, tiene derecho a acceder a la información
              personal que tenemos sobre usted y a solicitar que se corrija,
              actualice o elimine su información personal. Si desea ejercer este
              derecho, comuníquese con nosotros a través de la información de
              contacto en nuestro sitio.
            </p>

            <h4 className="text-lg font-bold">Retención de Datos</h4>
            <p>
              Cuando realiza un pedido a través del Sitio, mantendremos la
              Información de su pedido para nuestros registros a menos y hasta
              que nos solicite que eliminemos esta información.
            </p>

            <h4 className="text-lg font-bold">Cambios</h4>
            <p>
              Podemos actualizar esta política de privacidad de vez en cuando
              para reflejar, por ejemplo, cambios en nuestras prácticas o por
              otras razones operativas, legales o reglamentarias.
            </p>

            <h4 className="text-lg font-bold">Contáctenos</h4>
            <p>
              Para obtener más información sobre nuestras prácticas de
              privacidad, si tiene preguntas o si desea presentar una queja,
              comuníquese con nosotros por correo electrónico a{" "}
              <Link className="underline" to="mailto:admin@thelisting.do">
                admin@thelisting.do
              </Link>{" "}
              o por correo utilizando los detalles que se proporcionan a
              continuación:
            </p>
            <address>
              Calle 11 NO. 12 URBANIZACION FERNANDEZ, Santo Domingo, Distrito
              Nacional, 00000, República Dominicana
            </address>
          </div>
        </div>
      </section>
    </div>
  )
}
