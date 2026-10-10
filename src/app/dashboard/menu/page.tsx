import type { Metadata } from "next";
import { Suspense } from "react";
import { MenuEditor } from "../_components/menu-editor";
import { PageSkeleton } from "../_components/page-header";

export const metadata: Metadata = { title: "Menü" };

export default function MenuPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MenuEditor />
    </Suspense>
  );
}
