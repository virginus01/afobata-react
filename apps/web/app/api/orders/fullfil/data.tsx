import { cbk_fulFill_data_order } from "../../thirdparty/clubkonnect/fulfill_data_order";

export async function fulFill_data_order(product: ProductTypes, order: OrderType) {
  switch (product.partner) {
    case "cbk":
      return await cbk_fulFill_data_order(product, order);
  }
}
