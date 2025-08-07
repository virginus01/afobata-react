import { cbk_fulFill_tv_order } from "../../thirdparty/clubkonnect/fulfill_tv_order";

export async function fulFill_tv_order(product: ProductTypes, order: OrderType) {
  switch (product.partner) {
    case "cbk":
      return await cbk_fulFill_tv_order(product, order);
  }
}
