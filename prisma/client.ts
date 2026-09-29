// Cliente Prisma para scripts de línea de comandos (seed). La app usa src/lib/data/prisma.ts.
import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

export function createCliClient() {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })
}
