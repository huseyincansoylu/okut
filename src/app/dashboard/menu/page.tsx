import type { Metadata } from "next";
import { Suspense } from "react";
import { dict } from "@/lib/dictionary";
import { MenuEditor } from "../_components/menu-editor";
import { PageSkeleton } from "../_components/page-header";

export const metadata: Metadata = { title: dict.dashboard.menu.title };

export default function MenuPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MenuEditor />
    </Suspense>
  );
}
