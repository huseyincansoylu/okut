"use client";

import { useActionState } from "react";
import { PlayIcon } from "lucide-react";
import { signInAsDemo } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

export function DemoButton() {
  const [state, action, pending] = useActionState(signInAsDemo, undefined);

  return (
    <form action={action} className="flex flex-col gap-1">
      <Button type="submit" variant="ghost" size="lg" disabled={pending}>
        <PlayIcon />
        {pending ? "Açılıyor..." : "Demoyu dene"}
      </Button>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
