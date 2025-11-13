import { db, schema } from "@/db";
import { ok, okList, error, parsePagination, parseSort, toInt } from "@/lib/http";
import { and, eq, sql } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * Lists ticket orders with optional filters by showtime and status.
 */
export async function GET(req: Request) {

  if (!db) return error("DB not configured", 500);

  
  const url = new URL(req.url);
  
  const params = url.searchParams;
  
  const { page, pageSize, limit, offset } = parsePagination(params);
  
  const showtimeId = toInt(params.get("showtimeId"));
  
  const status = params.get("status");

  const where = and(

    showtimeId ? eq(schema.orders.showtimeId, showtimeId) : undefined,
    status ? eq(schema.orders.status, status) : undefined
  
  );

  const order =

    parseSort(params, {
      id: schema.orders.id,
      created_at: schema.orders.createdAt,
      status: schema.orders.status,
      total: schema.orders.total,

    }) || schema.orders.createdAt;


  const data = await db

    .select()
    .from(schema.orders)
    .where(where)
    .orderBy(order)
    .limit(limit)
    .offset(offset);


  const [{ count }] = await db

    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(schema.orders)
    .where(where);

  return okList(data, { page, pageSize, total: Number(count ?? data.length) });

}

/**
 * Creates a new order record once the payload passes validation.
 */
export async function POST(req: Request) {
  if (!db) return error("DB not configured", 500);

  const json = await req.json();
  
  const parsed = (await import("@/lib/validators")).OrderCreate.safeParse(json);
  
    if (!parsed.success) return error("Invalid request", 400, parsed.error.flatten());

  const [row] = await db

    .insert(schema.orders)
    .values({
      showtimeId: parsed.data.showtimeId,
      customer: parsed.data.customer,
      seats: parsed.data.seats,
      total: parsed.data.total,
      status: parsed.data.status ?? "pending",
   
    })
   
    .returning();
  
    return ok(row, 201);
}
