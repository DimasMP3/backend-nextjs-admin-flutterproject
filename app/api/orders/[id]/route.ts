import { db, schema } from "@/db";
import { ok, error, resolveRouteId, RouteParamsContext } from "@/lib/http";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * Retrieves an order by id.
 */
export async function GET(_: Request, ctx: RouteParamsContext) {

  if (!db) return error("DB not configured", 500);
  
  const id = await resolveRouteId(ctx);
  
    if (id == null) return error("Invalid id", 400);

  const [row] = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
  
    if (!row) return error("Not found", 404);

  return ok(row);

}

/**
 * Updates an existing order with partial payloads.
 */
export async function PUT(req: Request, ctx: RouteParamsContext) {
  
  if (!db) return error("DB not configured", 500);
  
  const id = await resolveRouteId(ctx);
  
    if (id == null) return error("Invalid id", 400);

  const json = await req.json();
  
  const parsed = (await import("@/lib/validators")).OrderUpdate.safeParse(json);
  
    if (!parsed.success) return error("Invalid request", 400, parsed.error.flatten());

  const [row] = await db.update(schema.orders).set(parsed.data).where(eq(schema.orders.id, id)).returning();
  
    if (!row) return error("Not found", 404);
  
  return ok(row);

}

/**
 * Removes an order record.
 */
export async function DELETE(_: Request, ctx: RouteParamsContext) {
  
  if (!db) return error("DB not configured", 500);
  
  const id = await resolveRouteId(ctx);
  
    if (id == null) return error("Invalid id", 400);

  const [row] = await db.delete(schema.orders).where(eq(schema.orders.id, id)).returning();
  
    if (!row) return error("Not found", 404);
  
  return ok({ ok: true });

}
