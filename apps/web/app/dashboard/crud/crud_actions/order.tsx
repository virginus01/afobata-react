import { adminAccess } from "@/app/helpers/isAdmin";
import { copyToClipboard } from "@/app/helpers/text";
import { curFormat } from "@/app/helpers/curFormat";
import { isNull } from "@/app/helpers/isNull";
import { readableDate } from "@/app/helpers/readableDate";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function OrderSideDetails({
  order,
  isUser = true,
  user,
}: {
  order: OrderType;
  isUser?: boolean;
  user: UserTypes;
}) {
  const [orderDetails, setOrderDetails] = useState<{ label: string; value: any }[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!order) return;

    const details: { label: string; value: any }[] = [];

    const pushIfValid = (label: string, value: any) => {
      if (!isNull(value)) details.push({ label, value });
    };

    pushIfValid("ID:", order.id);
    pushIfValid("Status:", order.status);

    if (order.type === "electric") {
      pushIfValid("Token:", !isNull(order?.tokens) ? order?.tokens![0]?.token : "loading...");
    }

    pushIfValid("Amount:", curFormat(order?.amount || 0, order.orderCurrencySymbol));
    pushIfValid("Duration:", order.duration?.title);
    pushIfValid("Payment Gateway:", order.paymentGateway);
    pushIfValid("Plan:", order.planInfo?.title);
    pushIfValid("Reference ID:", order.referenceId);
    pushIfValid("Order Date:", readableDate(order.createdAt, false));

    if (!isUser) {
      pushIfValid("Email:", order.email);
      pushIfValid("Customer Name:", order.name);
      pushIfValid("Settlement Date:", readableDate(order.settlementDate, false));
    }

    if (adminAccess(user)) {
      const partnerRes: any = order?.fulfillResponse ?? {};
      pushIfValid("Partner:", order?.partner);
      pushIfValid("Fullfill ID:", order?.fulfillId);
      pushIfValid("Partner Remark:", partnerRes?.remark);
      pushIfValid("Partner Status:", partnerRes?.status);
    }

    setOrderDetails(details);
  }, [order, isUser]);

  const handleCopy = (text: string, index: number) => {
    copyToClipboard(text, () => {
      setCopiedIndex(index);
      toast.success("Copied!");
      setTimeout(() => setCopiedIndex(null), 1500);
    });
  };

  return (
    <div className="flex flex-col text-xs">
      {orderDetails.map((detail, index) => (
        <div
          key={index}
          className="p-2 border-b border-gray-200 flex flex-row justify-between items-start"
        >
          <div className="font-normal">{detail.label}</div>
          <div
            className="text-right cursor-pointer"
            onClick={() => handleCopy(detail.value, index)}
            title="Click to copy"
          >
            {copiedIndex === index ? "Copied!" : detail.value}
          </div>
        </div>
      ))}
    </div>
  );
}
