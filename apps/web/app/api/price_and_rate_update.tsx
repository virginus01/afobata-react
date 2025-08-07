import { bulkUpsert, fetchDataWithConditions } from "./database/mongodb";

export const changeProductPrice = async () => {
  try {
    let conditions = {
      type: { $in: ["data", "electric", "tv", "airtime", "electric"] },
    };
    const products = await fetchDataWithConditions("products", conditions);

    let productArray: DataType[] = [];

    for (const product of products) {
      const updatedProduct = processXDiscount(product);
      const { createdAt, status, ...newUpdatedProduct } = updatedProduct;
      productArray.push(newUpdatedProduct);
    }
    const result = await bulkUpsert(productArray, "products");

    console.info("All product prices have been updated.", result);
  } catch (error) {
    console.error("Error in changeProductPrice:", error);
    return null;
  }
};

const processXDiscount = (product: DataType) => {
  try {
    let finalPrice = Number(product.price) || 0;
    let partnerPrice = Number(product.price) || 0;
    let discount = 0;
    let reseller_discount = 0;
    let partnerAdjustmentRate = 0;
    let note = "";

    if (product.type === "data") {
      const ratePrice = (7 / 100) * finalPrice;
      const roundedFinalPrice = Math.round(ratePrice + finalPrice);
      product.price = roundedFinalPrice;

      if (product.spName === "MTN") {
        discount = 2;
        reseller_discount = 5;
        partnerAdjustmentRate = 2;
      } else if (product.spName === "Glo") {
        discount = 1.5;
        reseller_discount = 3;
        partnerAdjustmentRate = 3.5;
      } else if (product.spName === "Airtel") {
        discount = 0.5;
        reseller_discount = 1.5;
        partnerAdjustmentRate = 2;
      } else if (product.spName === "m_9mobile") {
        discount = 2;
        reseller_discount = 5;
        partnerAdjustmentRate = 6;
      }
    } else if (product.type === "airtime") {
      if (product.spName === "MTN") {
        discount = 1;
        reseller_discount = 2.5;
        partnerAdjustmentRate = 3.5;
      } else if (product.spName === "Glo") {
        discount = 1.5;
        reseller_discount = 5;
        partnerAdjustmentRate = 6.5;
      } else if (product.spName === "Airtel") {
        discount = 1;
        reseller_discount = 2;
        partnerAdjustmentRate = 3;
      } else if (product.spName === "m_9mobile") {
        discount = 1;
        reseller_discount = 5;
        partnerAdjustmentRate = 6;
      }
    } else if (product.type === "electric") {
      discount = 0.1;
      reseller_discount = 0.3;
      partnerAdjustmentRate = 0.4;
    } else if (product.type === "tv") {
      discount = 0.1;
      reseller_discount = 0.5;
      partnerAdjustmentRate = 0.8;
    }

    product.partnerPrice = partnerPrice;
    product.partnerAdjustmentRate = partnerAdjustmentRate;
    product.note = note || "";
    product.discount = discount;
    product.reseller_discount = reseller_discount;

    return product;
  } catch (error) {
    console.error("Error in processXDiscount:", error);
    return product;
  }
};
