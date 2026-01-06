import { db, schema } from "@/db";
import { ok, error } from "@/lib/http";
import { createSnapTransaction } from "@/lib/midtrans";
import { z } from "zod";

export const runtime = "nodejs";

// Validation schema for payment creation
const PaymentCreateSchema = z.object({
    movieId: z.number().int().positive(),
    movieTitle: z.string().min(1),
    showtimeId: z.number().int().positive().optional(),
    cinema: z.string().min(1),
    seats: z.array(z.string()),
    amount: z.number().int().positive(),
    customerName: z.string().min(1),
    customerEmail: z.string().email(),
    customerPhone: z.string().optional(),
    enabledPayments: z.array(z.string()).optional(),
});

/**
 * Create a new payment transaction with Midtrans Snap
 * POST /api/payments/create
 */
export async function POST(req: Request) {
    if (!db) return error("DB not configured", 500);

    try {
        const json = await req.json();
        const parsed = PaymentCreateSchema.safeParse(json);

        if (!parsed.success) {
            return error("Invalid request", 400, parsed.error.flatten());
        }

        const data = parsed.data;

        // Generate unique order ID
        const orderId = `SANTIX-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Create Snap transaction with optional enabled_payments filter
        const snapResponse = await createSnapTransaction({
            transaction_details: {
                order_id: orderId,
                gross_amount: data.amount,
            },
            customer_details: {
                first_name: data.customerName,
                email: data.customerEmail,
                phone: data.customerPhone,
            },
            item_details: [
                {
                    id: `MOVIE-${data.movieId}`,
                    price: Math.floor(data.amount / data.seats.length),
                    quantity: data.seats.length,
                    name: `${data.movieTitle} - ${data.seats.join(", ")}`,
                },
            ],
            enabled_payments: data.enabledPayments,
        });

        // Save payment record to database
        const [payment] = await db
            .insert(schema.payments)
            .values({
                orderId,
                showtimeId: data.showtimeId,
                movieTitle: data.movieTitle,
                cinema: data.cinema,
                seats: JSON.stringify(data.seats),
                amount: data.amount,
                status: "pending",
                snapToken: snapResponse.token,
                snapRedirectUrl: snapResponse.redirect_url,
            })
            .returning();

        return ok({
            orderId,
            token: snapResponse.token,
            redirectUrl: snapResponse.redirect_url,
            paymentId: payment.id,
        }, 201);

    } catch (err) {
        console.error("Payment creation error:", err);
        return error("Failed to create payment", 500);
    }
}
