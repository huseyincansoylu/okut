"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SignInForm, SignUpForm } from "./auth-forms";

type Mode = "login" | "signup";

/** Sign-in and sign-up modals, driven by the `?auth=login|signup` query param. */
export function AuthDialog() {
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Giriş yap</DialogTitle>
            <DialogDescription>Menünü düzenlemek için hesabına giriş yap.</DialogDescription>
          </DialogHeader>
          <SignInForm next={next} />
          <p className="text-center text-sm text-muted-foreground">
            Hesabın yok mu?{" "}
            <Button variant="link" className="h-auto p-0" onClick={() => setMode("signup")}>
              Dükkanını oluştur
            </Button>
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={auth === "signup"} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dükkanını oluştur</DialogTitle>
            <DialogDescription>
              Hesabın ve dükkanın birlikte oluşturulur. Müşterilerin menüyü kayıt olmadan görür.
            </DialogDescription>
          </DialogHeader>
          <SignUpForm />
          <p className="text-center text-sm text-muted-foreground">
            Zaten hesabın var mı?{" "}
            <Button variant="link" className="h-auto p-0" onClick={() => setMode("login")}>
              Giriş yap
            </Button>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
