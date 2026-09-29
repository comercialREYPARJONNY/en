"use client"

import { BarChart3, FileQuestion, LayoutDashboard, ListChecks, MessageSquareQuote, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export const ADMIN_NAV = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/resultados", label: "Resultados generales", icon: BarChart3 },
  { href: "/admin/resultados/preguntas", label: "Por pregunta", icon: ListChecks },
  { href: "/admin/resultados/comentarios", label: "Comentarios", icon: MessageSquareQuote },
  { href: "/admin/resultados/abiertas", label: "Preguntas abiertas", icon: FileQuestion },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
]

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="grid gap-0.5">
      {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
