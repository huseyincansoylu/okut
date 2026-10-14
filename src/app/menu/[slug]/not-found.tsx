import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { dict } from "@/lib/dictionary";

export default function MenuNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-heading text-2xl font-semibold">{dict.menu.notFoundTitle}</h1>
      <p className="text-muted-foreground">{dict.menu.notFoundText}</p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        {dict.menu.backHome}
      </Link>
    </main>
  );
}
