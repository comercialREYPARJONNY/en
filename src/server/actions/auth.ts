"use server"

import { AuthError } from "next-auth"
import { signIn, signOut } from "@/auth"

export type LoginState = { error?: string }

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    })
    return {}
  } catch (error) {
    if (error instanceof AuthError) return { error: "Correo o contraseña incorrectos." }
    throw error // redirect de éxito
  }
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" })
}
