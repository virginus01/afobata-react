import { cbk_fulFill_electric_order } from "../../thirdparty/clubkonnect/fulfill_electric_order";

export async function fulFill_electric_order(product: ProductTypes, order: OrderType) {
  switch (product.partner) {
    case "cbk":
      return await cbk_fulFill_electric_order(product, order);
  }
}
