"use client"

import { LogOut, Menu } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { logout } from "@/server/actions/auth"
import { AdminNav } from "./admin-nav"

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
        R
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold">Diagnóstico de liderazgo</p>
        <p className="text-xs text-muted-foreground">Reypar</p>
      </div>
    </div>
  )
}

function LogoutButton({ email }: { email?: string | null }) {
  return (
    <form action={logout} className="space-y-2">
      {email && <p className="truncate px-3 text-xs text-muted-foreground">{email}</p>}
      <Button type="submit" variant="ghost" className="w-full justify-start gap-2.5 px-3 text-muted-foreground">
        <LogOut />
        Cerrar sesión
      </Button>
    </form>
  )
}

export function AdminShell({ email, children }: { email?: string | null; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="no-print sticky top-0 hidden h-dvh flex-col border-r bg-sidebar p-4 lg:flex">
        <div className="px-1 pb-6">
          <Brand />
        </div>
        <AdminNav />
        <div className="mt-auto">
          <LogoutButton email={email} />
        </div>
      </aside>

      <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/90 px-4 backdrop-blur lg:hidden">
        <Brand />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Abrir menú" />}>
            <Menu />
          </SheetTrigger>
          <SheetContent side="left" className="flex w-72 flex-col p-4">
            <SheetTitle className="sr-only">Menú</SheetTitle>
            <div className="pb-6">
              <Brand />
            </div>
            <AdminNav onNavigate={() => setOpen(false)} />
            <div className="mt-auto">
              <LogoutButton email={email} />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
