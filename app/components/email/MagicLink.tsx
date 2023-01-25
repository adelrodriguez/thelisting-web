import type { User } from "@prisma/client"
import { Container } from "@react-email/container"
import { Head } from "@react-email/head"
import { Hr } from "@react-email/hr"
import { Html } from "@react-email/html"
import { Img } from "@react-email/img"
import { Link } from "@react-email/link"
import { Preview } from "@react-email/preview"
import { Section } from "@react-email/section"
import { Text } from "@react-email/text"

import { RAILWAY_STATIC_URL } from "~/config/env.server"

export default function Email({
  magicLink,
  user,
}: {
  magicLink: string
  user: User
}) {
  const baseUrl = `http://${
    RAILWAY_STATIC_URL ? RAILWAY_STATIC_URL : "localhost:3000"
  }`

  return (
    <Html>
      <Head />
      <Preview>Log in with this magic link.</Preview>
      <Section style={main}>
        <Container style={container}>
          <Img
            src={`${baseUrl}/assets/img/the-listing-logo.png`}
            // width={200}
            height={48}
            alt="The Listing"
            style={logo}
          />
          <Text style={heading}>
            🪄 {user.firstName}, here's your magic link
          </Text>
          <Text style={paragraph}>
            <Link style={link} href={magicLink}>
              👉 Click here to log in 👈
            </Link>
          </Text>

          <Text style={paragraph}>
            If you didn't request this, please ignore this email.
          </Text>
          <Text style={paragraph}>
            Best,
            <br />- The Listing Team
          </Text>
          <Hr style={hr} />
          <Img
            src={`${baseUrl}/assets/img/ribbon.svg`}
            width={32}
            height={32}
            style={{
              WebkitFilter: "grayscale(100%)",
              filter: "grayscale(100%)",
              margin: "20px 0",
            }}
          />
          <Text style={footer}>The Listing SRL</Text>
        </Container>
      </Section>
    </Html>
  )
}

const fontFamily =
  '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif'

const main = {
  backgroundColor: "#ffffff",
}

const container = {
  margin: "0 auto",
  padding: "20px 25px 48px",
}

const logo = {
  margin: "0 auto",
}

const heading = {
  fontFamily,
  fontSize: "28px",
  fontWeight: "bold",
  margin: "48px 0 24px",
}

const paragraph = {
  fontFamily,
  fontSize: "16px",
  lineHeight: "26px",
}

const link = {
  color: "#e57c68",
}

const hr = {
  borderColor: "#dddddd",
  marginTop: "48px",
}

const footer = {
  color: "#8898aa",
  fontFamily,
  fontSize: "12px",
  marginLeft: "4px",
}
