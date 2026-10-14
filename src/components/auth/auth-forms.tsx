"use client";

import { useActionState } from "react";
import { signIn, signUp } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/client";

function FormStatus({ state }: { state: { error?: string; message?: string } | undefined }) {
  if (state?.error) return <p className="text-sm text-destructive">{state.error}</p>;
  if (state?.message) return <p className="text-sm text-green-600">{state.message}</p>;
  return null;
}

function EmailPasswordFields({ newPassword }: { newPassword?: boolean }) {
  const { dict } = useI18n();
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor={newPassword ? "signup-email" : "signin-email"}>{dict.auth.email}</Label>
        <Input id={newPassword ? "signup-email" : "signin-email"} name="email" type="email" required autoComplete="email" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={newPassword ? "signup-password" : "signin-password"}>{dict.auth.password}</Label>
        <Input
          id={newPassword ? "signup-password" : "signin-password"}
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={newPassword ? "new-password" : "current-password"}
        />
      </div>
    </>
  );
}

export function SignInForm({ next }: { next?: string }) {
  const { dict } = useI18n();
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <EmailPasswordFields />
      <FormStatus state={state} />
      <Button type="submit" disabled={pending}>
        {pending ? dict.auth.wait : dict.common.signIn}
      </Button>
    </form>
  );
}

export function SignUpForm() {
  const { dict } = useI18n();
  const [state, action, pending] = useActionState(signUp, undefined);

  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="shopName">{dict.auth.shopName}</Label>
        <Input id="shopName" name="shopName" required minLength={2} maxLength={60} placeholder={dict.auth.shopNamePlaceholder} />
      </div>
      <EmailPasswordFields newPassword />
      <FormStatus state={state} />
      <Button type="submit" disabled={pending}>
        {pending ? dict.auth.wait : dict.common.createShop}
      </Button>
    </form>
  );
}
