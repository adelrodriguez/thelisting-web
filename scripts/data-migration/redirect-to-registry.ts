/* eslint-disable no-console */
import { ListingStatus, PrismaClient } from "@prisma/client"

async function main() {
  const prisma = new PrismaClient()

  const listings = await prisma.listing.findMany({
    where: {
      status: {
        in: [ListingStatus.Draft, ListingStatus.Published],
      },
    },
  })

  for (const listing of listings) {
    await prisma.listing.update({
      data: {
        redirectUrl: `/${listing.path}/registry`,
      },
      where: {
        id: listing.id,
      },
    })

    console.log(`Created redirectUrl for listing ${listing.path}`)
  }
}

void main()
