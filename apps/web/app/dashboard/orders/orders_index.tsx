import React from "react";
import OrdersOverView from "./orders_overview";
import { generateConfig } from "../config";

interface OrdersIndexProps {
  params: { action: string; base: string; seg1: string };
  siteInfo: any;
  user: any;
  auth: any;
  data: any;
  type?: string;
  status?: string;
  id?: string;
  baseData: any;
}

const OrdersIndex: React.FC<OrdersIndexProps> = ({
  params,
  siteInfo,
  user,
  auth,
  data,
  type,
  status,
  id,
  baseData,
}) => {
  const baseConfig = generateConfig(user, type, status);
  const config = baseConfig[params.base] || { columns: [], conditions: {} };

  return (
    <div className="bg-gray-50">
      <OrdersOverView
        type={type!}
        table={"orders"}
        status={status!}
        params={params}
        user={user!}
        initalData={data}
        siteInfo={siteInfo!}
        columns={config.columns}
        baseData={baseData}
      />
    </div>
  );
};

export default OrdersIndex;
