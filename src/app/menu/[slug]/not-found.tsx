import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function MenuNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-heading text-2xl font-semibold">Menü bulunamadı</h1>
      <p className="text-muted-foreground">Aradığınız dükkan mevcut değil ya da adresi değişmiş olabilir.</p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Ana sayfaya dön
      </Link>
    </main>
  );
}
