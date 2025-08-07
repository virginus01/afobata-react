import { Data } from '@/app/models/Data';

export class Order {
  id?: string = '';
  userId?: string = '';
  productId?: string = '';
  brandId?: string = '';
  title?: string = '';
  customerId?: string = '';
  email?: string = '';
  price?: number = 0;
  rates?: any = {};
  partner?: 'cbk' | '' = '';
  quantity?: number = 0;
  beneficiaryMobileNumbers?: string = '';
  refunded?: boolean = false;
  settlementDate?: number = 0;
  mobileNumber?: string = '';
  name?: string = '';
  status?:
    | 'live'
    | 'abandoned'
    | 'archived'
    | 'success'
    | 'pending'
    | 'paid'
    | 'successful'
    | 'processing'
    | 'processed'
    | 'completed'
    | 'invalid'
    | 'refunded'
    | 'cancelled' = 'pending';
  amount?: number = 0;
  brandOwnerSettled?: boolean = false;
  brandOwnerSettledConfirmation?: boolean = false;
  sellerData?: UserTypes = {} as UserTypes;
  affilliateSettled?: boolean = false;
  amountReceived?: string = '';
  paymentGateway?: 'paystack' | 'flutterwave' | '' = '';
  referenceId?: string = '';
  createdAt?: string = '';
  cart?: CartItem[] = [];
  subTotal?: number = 0;
  walletId?: string = '';
  fulfillId?: string = '';
  tokens?: { token?: string }[] = [];
  downloadUrl?: string = '';
  products?: ProductTypes[] = [];
  type?: string = '';
  orderValue?: number = 0;
  commission?: number = 0;
  subsidy?: number = 0;
  discount?: number = 0;
  orderBrand?: string = '';
  orderBrandOwner?: string = '';
  orderBrandOwnerWalletId?: string = '';
  others?: any = {};
  mille?: number = 0;
  returnNotEnoughFund?: boolean = false;
  planInfo?: PackageTypes = {} as PackageTypes;
  password?: string | number = '';
  redirectUrl?: string = '';
  fulFilmentType?: string = '';
  product_files?: FileType = {} as FileType;
  processing?: boolean = false;

  orderBrandCommission?: _SettlementBrandDetailsModel = {} as _SettlementBrandDetailsModel;
  productBrandCommission?: _SettlementBrandDetailsModel = {} as _SettlementBrandDetailsModel;
  orderBrandCommissionStatus?: boolean = false;
  masterCommission?: number = 0;
  masterCommissionStatus?: boolean = false;
  productParentBrandCommission?: number = 0;
  productParentBrandCommissionStatus?: boolean = false;
  orderParentBrandCommission?: number = 0;
  orderParentBrandCommissionStatus?: boolean = false;
  onwerRevenue?: number = 0;
  onwerRevenueStatus?: boolean = false;

  orderBrandDetails?: _SettlementBrandDetailsModel = {} as _SettlementBrandDetailsModel;
  orderParentBrandDetails?: _SettlementBrandDetailsModel = {} as _SettlementBrandDetailsModel;
  productBrandDetails?: _SettlementBrandDetailsModel = {} as _SettlementBrandDetailsModel;
  masterBrandDetails?: _SettlementBrandDetailsModel = {} as _SettlementBrandDetailsModel;
  productParentBrandDetails?: _SettlementBrandDetailsModel = {} as _SettlementBrandDetailsModel;

  duration?: PlanDuration = {} as PlanDuration;
  orderCurrencySymbol?: string = '';
  orderCurrency?: string = '';
  exchangeRate?: number = 1;
  productPrice?: number = 0;
  currency?: string = '';
  fulfillResponse?: any = {};
  productData?: Data = {} as Data;

  getFormattedAmount?(): string {
    return `${this.orderCurrencySymbol}${(this.amount ?? 0).toFixed(2)}`;
  }
}
