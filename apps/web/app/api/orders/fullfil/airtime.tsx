import { cbk_fulFill_airtime_order } from "../../thirdparty/clubkonnect/fulfill_airtime_order";

export async function fulFill_airtime_order(product: ProductTypes, order: OrderType) {
  switch (product.partner) {
    case "cbk":
      return await cbk_fulFill_airtime_order(product, order);
  }
}
