"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo";
import { createShop } from "@/lib/shops";

export type AuthState = { error?: string; message?: string } | undefined;

const credentials = z.object({
  email: z.email("Geçerli bir e-posta girin."),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı."),
});

const signUpSchema = credentials.extend({
  shopName: z.string().trim().min(2, "Dükkan adı en az 2 karakter olmalı.").max(60),
});

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "E-posta veya şifre hatalı." };

  redirect(safeNext(formData.get("next")));
}

export async function signInAsDemo(): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
  if (error) {
    console.error("[auth] demo sign-in failed:", error.status, error.code);
    return { error: "Demo hesabına şu an girilemiyor. Lütfen biraz sonra tekrar deneyin." };
  }
  redirect("/dashboard");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { email, password, shopName } = parsed.data;

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });
  if (error) {
    console.warn("[auth] sign-up failed:", error.status, error.code);
    if (error.code === "email_address_invalid") {
      return { error: "Bu e-posta adresi kabul edilmedi. Gerçek ve erişebildiğiniz bir adres girin." };
    }
    if (error.code === "user_already_exists") return { error: "Bu e-posta ile zaten kayıt olunmuş." };
    if (error.status === 429 || error.code?.startsWith("over_")) {
      return { error: "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin." };
    }
    return { error: error.message };
  }

  // With email confirmation on, Supabase returns a fake user with no identities
  // for an already-registered address (to avoid leaking which emails exist).
  if (!data.user || data.user.identities?.length === 0) {
    return { error: "Bu e-posta ile zaten kayıt olunmuş." };
  }

  try {
    await createShop(data.user.id, shopName);
  } catch {
    // The account exists; the dashboard lets the owner create the shop later.
    console.error("Shop creation failed during sign-up");
  }

  if (data.session) redirect("/dashboard");
  return { message: "Kayıt alındı. E-postanızdaki onay linkine tıklayın." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
