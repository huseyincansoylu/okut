import { CreateShopForm } from "../create-shop-form";
import { PageBody, PageHeader } from "./page-header";

export function NoShop() {
  return (
    <PageBody>
      <PageHeader title="Hoş geldin" description="Paneli kullanmaya başlamak için önce dükkanını oluştur." />
      <CreateShopForm />
    </PageBody>
  );
}
