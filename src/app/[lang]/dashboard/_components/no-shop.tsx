import { getDictionary } from "@/i18n/server";
import { CreateShopForm } from "../create-shop-form";
import { PageBody, PageHeader } from "./page-header";

export async function NoShop() {
  const dict = await getDictionary();

  return (
    <PageBody>
      <PageHeader title={dict.dashboard.welcomeTitle} description={dict.dashboard.welcomeText} />
      <CreateShopForm />
    </PageBody>
  );
}
