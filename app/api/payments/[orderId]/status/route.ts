import { db, schema } from "@/db";
import { ok, error } from "@/lib/http";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

interface Params {
    orderId: string;
}

/**
 * Get payment status by order ID
 * GET /api/payments/:orderId/status
 */
export async function GET(
    _req: Request,
    context: { params: Promise<Params> }
) {
    if (!db) return error("DB not configured", 500);

    try {
        const { orderId } = await context.params;

        const [payment] = await db
            .select()
            .from(schema.payments)
            .where(eq(schema.payments.orderId, orderId))
            .limit(1);

        if (!payment) {
            return error("Payment not found", 404);
        }

        return ok({
            orderId: payment.orderId,
            status: payment.status,
            amount: payment.amount,
            paymentType: payment.paymentType,
            movieTitle: payment.movieTitle,
            cinema: payment.cinema,
            seats: JSON.parse(payment.seats),
            paidAt: payment.paidAt,
            createdAt: payment.createdAt,
        });

    } catch (err) {
        console.error("Status check error:", err);
        return error("Failed to get payment status", 500);
    }
}
