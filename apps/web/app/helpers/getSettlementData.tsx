export const getSettlementData = async (
  brand: BrandType,
): Promise<_SettlementBrandDetailsModel> => {
  const createBrandDetails = (brandData?: BrandType): _SettlementBrandDetailsModel => ({
    id: brandData?.id ?? '',
    ownerId: brandData?.userId ?? '',
    ownerWalletId: brandData?.ownerData?.wallet?.id ?? '',
    accountNumber: brandData?.ownerData?.accountNumber ?? null,
    accountName: brandData?.ownerData?.accountName ?? '',
    bank: brandData?.ownerData?.bankCode ?? '',
    country: brandData?.ownerData?.country ?? '',
    currencyCode: brandData?.ownerData?.defaultCurrency ?? '',
    bankName: brandData?.ownerData?.bankCode ?? '',
    shareRate: brand.share_value || 0,
  });
  const data = {
    masterBrandDetails: createBrandDetails(brand.masterBrandData),
    parentBrandDetails: createBrandDetails(brand.parentBrandData),
    orderBrandDetails: createBrandDetails(brand),
  };
  return data as any;
};
