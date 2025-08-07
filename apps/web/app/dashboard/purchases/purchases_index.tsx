import InvoiceOverview from "./invoice_overview";
import PurchasedProductsOverview from "./purchased_products_overview";

export default function PurchasesIndex({ siteInfo, user, params }: ActionProps) {
  return (
    <div>
      {params.action === "invoices" && (
        <InvoiceOverview user={user} siteInfo={siteInfo} params={params} />
      )}

      {params.action === "products" && (
        <PurchasedProductsOverview user={user} siteInfo={siteInfo} params={params} />
      )}
    </div>
  );
}
