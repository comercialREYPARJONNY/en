import bcrypt from "bcryptjs"
import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { prisma } from "@/lib/data/prisma"

const credentialsSchema = z.object({
  email: z.email().transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1).max(200),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw)
        if (!parsed.success) throw new CredentialsSignin()
        const user = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } })
        // Se compara siempre un hash para no revelar si el correo existe por tiempo de respuesta.
        const hash = user?.passwordHash ?? "$2b$12$Z4DOqZ4dFPz4FJw8Bm9jgux3CQ.BkOTnmtfYGy45mPW2QOTfk5Fde"
        const valid = await bcrypt.compare(parsed.data.password, hash)
        if (!user || !valid) throw new CredentialsSignin()
        return { id: user.id, email: user.email, name: user.name ?? "Administrador" }
      },
    }),
  ],
})
