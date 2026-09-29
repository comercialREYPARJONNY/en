import "server-only"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

/** Para páginas y Server Actions del panel: redirige al login si no hay sesión. */
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) redirect("/admin/login")
  return session
}

/** Para route handlers: devuelve null si no hay sesión. */
export async function getAdminSession() {
  const session = await auth()
  return session?.user ? session : null
}
