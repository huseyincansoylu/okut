import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/i18n/server";
import { MenuEditor } from "../_components/menu-editor";
import { PageSkeleton } from "../_components/page-header";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDictionary()).dashboard.menu.title };
}

export default function MenuPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MenuEditor />
    </Suspense>
  );
}
