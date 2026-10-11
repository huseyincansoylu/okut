"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import type { Dictionary } from "@/i18n/dictionary";
import { getRequestDictionary, getRequestLocale } from "@/i18n/request";
import { createClient } from "@/lib/supabase/server";
import { createShop } from "@/lib/shops";

export type AuthState = { error?: string; message?: string } | undefined;

function credentials(dict: Dictionary) {
  return z.object({
    email: z.email(dict.auth.errors.invalidEmail),
    password: z.string().min(8, dict.auth.errors.passwordTooShort),
  });
}

function signUpSchema(dict: Dictionary) {
  return credentials(dict).extend({
    shopName: z.string().trim().min(2, dict.errors.shopNameLength).max(60, dict.errors.shopNameMax),
  });
}

/** Where to go after signing in: a same-site path from `next`, else the dashboard. */
function safeNext(value: FormDataEntryValue | null, fallback: string) {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  // Resolve like the browser would, so tricks such as "/\evil.com" can't leave the site.
  const url = new URL(value, "http://okut.local");
  return url.origin === "http://okut.local" ? url.pathname + url.search : fallback;
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const dict = await getRequestDictionary();
  const parsed = credentials(dict).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: dict.auth.errors.wrongCredentials };

  redirect(safeNext(formData.get("next"), `/${await getRequestLocale()}/dashboard`));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const dict = await getRequestDictionary();
  const parsed = signUpSchema(dict).safeParse(Object.fromEntries(formData));
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
    if (error.code === "email_address_invalid") return { error: dict.auth.errors.emailRejected };
    if (error.code === "user_already_exists") return { error: dict.auth.errors.alreadyRegistered };
    if (error.status === 429 || error.code?.startsWith("over_")) {
      return { error: dict.auth.errors.tooManyAttempts };
    }
    return { error: error.message };
  }

  // With email confirmation on, Supabase returns a fake user with no identities
  // for an already-registered address (to avoid leaking which emails exist).
  if (!data.user || data.user.identities?.length === 0) {
    return { error: dict.auth.errors.alreadyRegistered };
  }

  try {
    await createShop(data.user.id, shopName);
  } catch {
    // The account exists; the dashboard lets the owner create the shop later.
    console.error("Shop creation failed during sign-up");
  }

  if (data.session) redirect(`/${await getRequestLocale()}/dashboard`);
  return { message: dict.auth.confirmEmail };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${await getRequestLocale()}`);
}
