import { db, schema } from "@/db";
import { ok, error } from "@/lib/http";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";

export const runtime = "nodejs";

const HistoryQuerySchema = z.object({
    email: z.string().email(),
});

/**
 * Get payment history for a customer by email
 * GET /api/payments/history?email=xxx
 */
export async function GET(req: Request) {
    if (!db) return error("DB not configured", 500);

    try {
        const url = new URL(req.url);
        const email = url.searchParams.get("email");

        if (!email) {
            return error("Email is required", 400);
        }

        const parsed = HistoryQuerySchema.safeParse({ email });
        if (!parsed.success) {
            return error("Invalid email format", 400);
        }

        // Fetch paid payments for this customer
        const payments = await db
            .select({
                id: schema.payments.id,
                orderId: schema.payments.orderId,
                movieTitle: schema.payments.movieTitle,
                cinema: schema.payments.cinema,
                seats: schema.payments.seats,
                amount: schema.payments.amount,
                status: schema.payments.status,
                paymentType: schema.payments.paymentType,
                paidAt: schema.payments.paidAt,
                createdAt: schema.payments.createdAt,
                showtimeId: schema.payments.showtimeId,
            })
            .from(schema.payments)
            .where(
                and(
                    eq(schema.payments.customerEmail, email),
                    eq(schema.payments.status, "paid")
                )
            )
            .orderBy(desc(schema.payments.paidAt));

        // Parse seats JSON and format response
        const tickets = payments.map((p) => ({
            id: p.id,
            orderId: p.orderId,
            movieTitle: p.movieTitle,
            cinema: p.cinema,
            seats: JSON.parse(p.seats || "[]"),
            amount: p.amount,
            status: p.status,
            paymentType: p.paymentType,
            paidAt: p.paidAt,
            createdAt: p.createdAt,
            showtimeId: p.showtimeId,
        }));

        return ok({ tickets });
    } catch (err) {
        console.error("Payment history error:", err);
        return error("Failed to fetch payment history", 500);
    }
}
