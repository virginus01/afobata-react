import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Verify Paystack signature
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const body = await req.json();
    const hash = crypto.createHmac("sha512", secret!).update(JSON.stringify(body)).digest("hex");

    if (hash !== req.headers.get("x-paystack-signature")) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = body;

    if (event.event === "charge.success" && event.data.channel === "bank_transfer") {
      const { amount, currency, customer, reference } = event.data;

      // Process the deposit (e.g., credit user’s account)
      console.info(
        `Received ${amount / 100} ${currency} from ${customer.email} (Ref: ${reference})`
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
