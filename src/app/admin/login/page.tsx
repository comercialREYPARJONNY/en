import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Ingresar" }

export default async function LoginPage() {
  if ((await auth())?.user) redirect("/admin")
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            R
          </span>
          <div>
            <p className="font-semibold leading-tight">Diagnóstico de liderazgo</p>
            <p className="text-sm text-muted-foreground">Panel administrativo · Reypar</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
