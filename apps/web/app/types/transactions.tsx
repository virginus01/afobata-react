interface TransactionsModel {
  id?: string | null;
  jsonrpc?: string | null;
  method?: string | null;
  network?: string | null;
  eventType?: string | null;
  monitoredAddress?: string | null;
  serviceType?: string | null;
  type?: string | null;
  txHash?: string | null;
  blockHash?: string | null;
  blockNumber?: number | null;
  confirmations?: number | null;
  confirmationStatus?: string;
  status?: "processed" | "completed" | "pending";
  from?: string[] | null;
  to?: string[] | null;
  value?: string | null;
  timestamp?: string | null;
  fee?: string | null;
  brandCommission?: number;

  brandCommissionStatus?: boolean;

  masterCommission?: number;

  masterCommissionStatus?: boolean;

  parentBrandCommission?: number;

  parentBrandCommissionStatus?: boolean;

  onwerRevenue?: number;

  onwerRevenueStatus?: boolean;

  orderBrandDetails?: _SettlementBrandDetailsModel;

  parentBrandDetails?: _SettlementBrandDetailsModel;

  productBrandDetails?: _SettlementBrandDetailsModel;

  masterBrandDetails?: _SettlementBrandDetailsModel;

  referenceId?: string;
}
