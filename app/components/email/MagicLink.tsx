import type { User } from "@prisma/client"
import { Container } from "@react-email/container"
import { Head } from "@react-email/head"
import { Hr } from "@react-email/hr"
import { Html } from "@react-email/html"
import { Img } from "@react-email/img"
import { Link } from "@react-email/link"
import { Preview } from "@react-email/preview"
import { Section } from "@react-email/section"
import { Tailwind } from "@react-email/tailwind"
import { Text } from "@react-email/text"

import { THE_LISTING_LOGO_BLACK } from "~/config/consts"
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
      <Head>
        <title>Login to The Listing</title>
      </Head>
      <Preview>Log in with this magic link 🪄</Preview>
      <Tailwind>
        <Section className="bg-white">
          <Container className="mx-auto px-6 pt-5 pb-12">
            <Img
              src={baseUrl + THE_LISTING_LOGO_BLACK}
              height={48}
              alt="The Listing"
              className="mx-auto"
            />
            <Text className="mt-12 mb-6 text-center text-xl font-bold">
              🪄 {user.firstName}, here's your magic link
            </Text>
            <Text className="text-center leading-6">
              <Link className="text-base text-amber-500" href={magicLink}>
                👉 Click here to log in 👈
              </Link>
            </Text>

            <Text className="text-sm leading-6">
              You can also copy and paste this link into your browser:{" "}
              <Link href={magicLink}>{magicLink}</Link>
            </Text>

            <Text className="text-sm leading-6">
              If you didn't request this, please ignore this email.
            </Text>
            <Text className="text-sm leading-6">
              Best,
              <br />- The Listing Team
            </Text>
            <Hr className="mt-12 border-gray-500" />
            <Img
              src={`${baseUrl}/assets/images/ribbon.svg`}
              width={32}
              height={32}
              style={{
                WebkitFilter: "grayscale(100%)",
                filter: "grayscale(100%)",
                margin: "20px 0",
              }}
            />
            <Text className="ml-1 text-sm text-gray-600">The Listing SRL</Text>
          </Container>
        </Section>
      </Tailwind>
    </Html>
  )
}
