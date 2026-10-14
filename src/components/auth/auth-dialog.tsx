"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/i18n/client";
import { SignInForm, SignUpForm } from "./auth-forms";

type Mode = "login" | "signup";

/** Sign-in and sign-up modals, driven by the `?auth=login|signup` query param. */
export function AuthDialog() {
  const { dict } = useI18n();
  const t = dict.auth;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const auth = searchParams.get("auth");
  const next = searchParams.get("next") ?? undefined;

  function setMode(value: Mode | null) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("auth", value);
    } else {
      params.delete("auth");
      params.delete("next");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const onOpenChange = (open: boolean) => !open && setMode(null);

  return (
    <>
      <Dialog open={auth === "login"} onOpenChange={onOpenChange}>
        <DialogContent closeLabel={dict.common.close}>
          <DialogHeader>
            <DialogTitle>{t.signInTitle}</DialogTitle>
            <DialogDescription>{t.signInDescription}</DialogDescription>
          </DialogHeader>
          <SignInForm next={next} />
          <p className="text-center text-sm text-muted-foreground">
            {t.noAccount}{" "}
            <Button variant="link" className="h-auto p-0" onClick={() => setMode("signup")}>
              {dict.common.createShop}
            </Button>
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={auth === "signup"} onOpenChange={onOpenChange}>
        <DialogContent closeLabel={dict.common.close}>
          <DialogHeader>
            <DialogTitle>{t.signUpTitle}</DialogTitle>
            <DialogDescription>{t.signUpDescription}</DialogDescription>
          </DialogHeader>
          <SignUpForm />
          <p className="text-center text-sm text-muted-foreground">
            {t.haveAccount}{" "}
            <Button variant="link" className="h-auto p-0" onClick={() => setMode("login")}>
              {dict.common.signIn}
            </Button>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
