import { mode } from "@/app/src/constants";

// types.ts
type BlockCypherWebhookResponse = {
  id: string;
  url: string;
  address: string;
  event: string;
  confirmations: number;
  created_at: string;
};

type WebhookError = {
  error: string;
  status: number;
};

// constants.ts
export const BLOCKCYPHER_ENDPOINTS = {
  test: "https://api.blockcypher.com/v1/btc/test3/hooks",
  main: "https://api.blockcypher.com/v1/btc/main/hooks",
} as const;

export const WEBHOOK_CONFIG = {
  url: "https://afobata.com/api/a/post/api_deposit_trnx_webhook",
  confirmations: 1,
  events: "tx-confirmation",
} as const;

export async function bcy_deposit_webhook({
  address,
  blockCypherToken = "ad98c7a2699f41ce90a963be8d1e492a",
}: {
  address: string;
  blockCypherToken?: string;
}): Promise<BlockCypherWebhookResponse | WebhookError | null> {
  if (!address) {
    console.error("deposit_webhook: Address is required");
    return {
      error: "Address is required",
      status: 400,
    };
  }

  try {
    const endpoint =
      mode === "test"
        ? `${BLOCKCYPHER_ENDPOINTS.test}?token=${blockCypherToken}`
        : `${BLOCKCYPHER_ENDPOINTS.main}?token=${blockCypherToken}`;

    const webhookUrl = new URL(WEBHOOK_CONFIG.url);
    if (!webhookUrl.protocol.startsWith("https")) {
      throw new Error("Webhook URL must use HTTPS protocol");
    }

    const body = {
      event: "confirmed-tx",
      url: WEBHOOK_CONFIG.url,
      address,
      confirmations: WEBHOOK_CONFIG.confirmations || 6,
    };

    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const res = await response.json();

    return res;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("deposit_webhook error:", {
      error: errorMessage,
      address,
      mode,
    });

    return {
      error: errorMessage,
      status: 500,
    };
  }
}

// Example usage with webhook deletion
export async function deleteWebhook(webhookId: string): Promise<boolean> {
  try {
    const endpoint =
      mode === "test"
        ? `${BLOCKCYPHER_ENDPOINTS.test}/${webhookId}?token=ad98c7a2699f41ce90a963be8d1e492a`
        : `${BLOCKCYPHER_ENDPOINTS.main}/${webhookId}?token=ad98c7a2699f41ce90a963be8d1e492a`;

    const response = await fetch(endpoint, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to delete webhook:", error);
    return false;
  }
}
