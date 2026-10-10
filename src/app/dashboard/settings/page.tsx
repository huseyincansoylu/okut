import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUserId } from "@/lib/auth";
import { getOwnedShop } from "@/lib/shops";
import { NoShop } from "../_components/no-shop";
import { PageBody, PageHeader, PageSkeleton } from "../_components/page-header";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Ayarlar" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  const shop = await getOwnedShop(await requireUserId());
  if (!shop) return <NoShop />;

  return (
    <PageBody>
      <PageHeader title="Ayarlar" description="Dükkanının adı, logosu ve menü rengi" />
      <SettingsForm shop={{ name: shop.name, logoUrl: shop.logoUrl, theme: shop.theme }} />
    </PageBody>
  );
}
