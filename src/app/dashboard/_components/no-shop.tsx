import { dict } from "@/lib/dictionary";
import { CreateShopForm } from "../create-shop-form";
import { PageBody, PageHeader } from "./page-header";

export function NoShop() {
  return (
    <PageBody>
      <PageHeader title={dict.dashboard.welcomeTitle} description={dict.dashboard.welcomeText} />
      <CreateShopForm />
    </PageBody>
  );
}
