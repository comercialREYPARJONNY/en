"use client"

import { Loader2 } from "lucide-react"
import { useActionState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, type LoginState } from "@/server/actions/auth"

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {})
  return (
    <Card>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" name="email" type="email" autoComplete="username" required className="h-10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-10" />
          </div>
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="h-10 w-full" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            Ingresar
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
