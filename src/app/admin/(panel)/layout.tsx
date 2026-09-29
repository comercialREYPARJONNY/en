import type { Metadata } from "next"
import { AdminShell } from "@/components/admin/admin-shell"
import { requireAdmin } from "@/lib/auth-guard"

export const metadata: Metadata = { title: "Panel" }

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdmin()
  return <AdminShell email={session.user?.email}>{children}</AdminShell>
}
