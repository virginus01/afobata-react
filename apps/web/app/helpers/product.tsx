export function getProductFullFilUrl({
  product,
  order,
  brand,
  user,
}: {
  product: DataType;
  order: OrderType;
  brand: BrandType;
  user: UserTypes;
}) {
  let productFullFilLink = product.slug;
  let brandSubDomain = brand.subDomain;
  let fullLink = `${brandSubDomain}.local:3000/${productFullFilLink}?passcode=${order.id}`;

  return fullLink;
}
