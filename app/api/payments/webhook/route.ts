import { db, schema } from "@/db";
import { verifyWebhookSignature } from "@/lib/midtrans";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

interface MidtransNotification {
    transaction_time: string;
    transaction_status: string;
    transaction_id: string;
    status_message: string;
    status_code: string;
    signature_key: string;
    payment_type: string;
    order_id: string;
    merchant_id: string;
    gross_amount: string;
    fraud_status?: string;
    currency: string;
}

/**
 * Handle Midtrans payment webhook notifications
 * POST /api/payments/webhook
 */
export async function POST(req: Request) {
    if (!db) {
        return new Response(JSON.stringify({ error: "DB not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const notification: MidtransNotification = await req.json();

        // Verify signature
        const isValid = verifyWebhookSignature(
            notification.order_id,
            notification.status_code,
            notification.gross_amount,
            notification.signature_key
        );

        if (!isValid) {
            console.error("Invalid webhook signature for order:", notification.order_id);
            return new Response(JSON.stringify({ error: "Invalid signature" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Map Midtrans status to our status
        let paymentStatus: string;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        if (transactionStatus === "capture") {
            paymentStatus = fraudStatus === "accept" ? "paid" : "pending";
        } else if (transactionStatus === "settlement") {
            paymentStatus = "paid";
        } else if (transactionStatus === "pending") {
            paymentStatus = "pending";
        } else if (
            transactionStatus === "deny" ||
            transactionStatus === "expire" ||
            transactionStatus === "cancel"
        ) {
            paymentStatus = transactionStatus === "expire" ? "expired" : "failed";
        } else {
            paymentStatus = "pending";
        }

        // Update payment record
        const [updated] = await db
            .update(schema.payments)
            .set({
                status: paymentStatus,
                midtransTransactionId: notification.transaction_id,
                paymentType: notification.payment_type,
                paidAt: paymentStatus === "paid" ? new Date().toISOString() : null,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(schema.payments.orderId, notification.order_id))
            .returning();

        if (!updated) {
            console.error("Payment not found for order:", notification.order_id);
            return new Response(JSON.stringify({ error: "Payment not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        console.log(`Payment ${notification.order_id} updated to ${paymentStatus}`);

        return new Response(JSON.stringify({ status: "ok" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error("Webhook processing error:", err);
        return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
