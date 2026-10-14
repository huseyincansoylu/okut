import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/i18n/server";
import { requireUserId } from "@/lib/auth";
import { getOwnedShop } from "@/lib/shops";
import { NoShop } from "../_components/no-shop";
import { PageBody, PageHeader, PageSkeleton } from "../_components/page-header";
import { SettingsForm } from "./settings-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDictionary()).dashboard.settings.title };
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  const [shop, dict] = await Promise.all([requireUserId().then(getOwnedShop), getDictionary()]);
  if (!shop) return <NoShop />;

  return (
    <PageBody>
      <PageHeader title={dict.dashboard.settings.title} description={dict.dashboard.settings.description} />
      <SettingsForm
        shop={{
          name: shop.name,
          logoUrl: shop.logoUrl,
          theme: shop.theme,
          wifiName: shop.wifiName,
          wifiPassword: shop.wifiPassword,
        }}
      />
    </PageBody>
  );
}
