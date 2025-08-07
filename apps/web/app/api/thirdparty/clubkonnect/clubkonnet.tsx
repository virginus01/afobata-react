import { baseUrl } from "@/app/helpers/baseUrl";
import { cbkDummyResponse } from '@/app/helpers/cbkDummyResponse';
import { isNull } from '@/app/helpers/isNull';
import { randomNumber } from '@/app/helpers/randomNumber';

import { cbkMode } from "@/app/src/constants";

export const initializeCBK = async ({ route }: { route: string }): Promise<string> => {
  const cbk_userId = process.env.CLUBK_USERID || "";
  const cbk_secret = process.env.CLUBK_SECRET || "";

  // Validate environment variables
  if (isNull(cbk_userId) || isNull(cbk_secret)) {
    console.error("Error: Missing CLUBK_USERID or CLUBK_SECRET");
    throw new Error("Invalid configuration: CLUBK_USERID and CLUBK_SECRET must be set.");
  }

  const callback_url = await baseUrl("api/m/get/callback");

  // Construct the callback URL
  const randomParam = randomNumber(10);
  const baseCallbackUrl = `https://www.nellobytesystems.com/${route}`;

  const url = new URL(baseCallbackUrl);
  url.searchParams.append("UserID", cbk_userId);
  url.searchParams.append("APIKey", cbk_secret);
  url.searchParams.append("CallBackURL", callback_url);
  url.searchParams.append("rand", randomParam.toString());

  return url.toString();
};

export async function sendCBKReq({ url, order }: { url: string; order: OrderType }): Promise<any> {
  let res: any = { status: order.status };
  let status = order.status;

  try {
    if (cbkMode === "live") {
      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        console.error("An error occurred:", response.statusText);
        return {
          status,
        };
      }

      const text = await response.text();

      // Check if the response is empty
      if (!text || text.trim() === "") {
        console.error("Empty response received from API");
        return {
          status,
          error: "Empty response from server",
        };
      }

      try {
        // Only attempt to parse if we have content
        res = JSON.parse(text);
      } catch (err) {
        // Handle non-JSON responses - sometimes API might return plain text
        if (text.includes("ORDER_COMPLETED")) {
          res = { msg: text, status: "ORDER_COMPLETED" };
        } else if (text.includes("ORDER_RECEIVED")) {
          res = { msg: text, status: "ORDER_RECEIVED" };
        } else if (text.includes("AUTHENTICATION_FAILED")) {
          res = { msg: text, status: "AUTHENTICATION_FAILED_1" };
        } else if (text.includes("INVALID_CREDENTIALS")) {
          res = { msg: text, status: "INVALID_CREDENTIALS3" };
        } else if (text.includes("INSUFFICIENT_BALANCE")) {
          res = { msg: text, status: "INSUFFICIENT_BALANCE" };
        } else if (text.includes("ORDER_CANCELLED")) {
          res = { msg: text, status: "ORDER_CANCELLED" };
        } else if (text.includes("INVALID_MOBILENETWORK")) {
          res = { msg: text, status: "invalid" };
        } else {
          res = { msg: text, status: "ERROR" };
        }
      }
    } else {
      res = cbkDummyResponse("ORDER_COMPLETED");
    }

    // Ensure res.status exists before trimming
    const resStatus = res.status ? res.status.trim() : "ERROR";

    if (resStatus === "ORDER_RECEIVED") {
      status = "processing";
    } else if (resStatus === "ORDER_COMPLETED") {
      status = "processed";
    } else if (resStatus === "ORDER_CANCELLED") {
      status = "cancelled";
    } else if (resStatus === "INVALID_MOBILENETWORK") {
      status = "invalid";
    } else if (resStatus === "INVALID_CREDENTIALS3") {
      console.error("CBK Authentication failed");
      process.env.NODE_ENV === "development" && console.info(url);
    } else if (resStatus === "INSUFFICIENT_BALANCE") {
      console.error("INSUFFICIENT_BALANCE");
    } else {
      !res.balance && console.info(res);
      process.env.NODE_ENV === "development" && console.info(url);
    }

    if (["completed", "refunded", "processed"].includes(order.status!)) {
      status = order.status;
    }

    return {
      status,
      tokens: res.metertoken ? [{ token: res.metertoken ?? "" }] : [],
      id: res.orderid || res.transactionid || "",
      fulfillResponse: { ...res, status: resStatus },
      partner: "cbk",
    };
  } catch (error) {
    console.error("Fetch failed:", error);

    return {
      status: order.status,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function checkCBKBalance(): Promise<any> {
  try {
    const url = `${await initializeCBK({
      route: "APIWalletBalanceV1.asp",
    })}`;

    if (cbkMode === "test") return 50000;

    const balanceData = await sendCBKReq({ url: url, order: {} });

    const rawBalance = balanceData?.fulfillResponse?.balance ?? "0";
    const sanitizedBalance = rawBalance.replace(/,/g, "");

    return parseFloat(sanitizedBalance);
  } catch (error) {
    console.error("get cbt error ", error);
    return 0;
  }
}
