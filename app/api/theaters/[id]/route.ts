import { db, schema } from "@/db";
import { ok, error, resolveRouteId, RouteParamsContext } from "@/lib/http";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * Returns a single theater entry.
 */
export async function GET(_: Request, ctx: RouteParamsContext) {
  
  if (!db) return error("DB not configured", 500);
  
  const id = await resolveRouteId(ctx);
  
    if (id == null) return error("Invalid id", 400);

  const [row] = await db.select().from(schema.theaters).where(eq(schema.theaters.id, id));
  
    if (!row) return error("Not found", 404);
  
  return ok(row);

}

/**
 * Updates a theater entry.
 */
export async function PUT(req: Request, ctx: RouteParamsContext) {
  
  if (!db) return error("DB not configured", 500);
  
  const id = await resolveRouteId(ctx);
  
    if (id == null) return error("Invalid id", 400);

  const json = await req.json();
  
  
  const parsed = (await import("@/lib/validators")).TheaterUpdate.safeParse(json);
  
    if (!parsed.success) return error("Invalid request", 400, parsed.error.flatten());

  const [row] = await db.update(schema.theaters).set(parsed.data).where(eq(schema.theaters.id, id)).returning();
  
    if (!row) return error("Not found", 404);
  
  return ok(row);

}

/**
 * Deletes a theater.
 */
export async function DELETE(_: Request, ctx: RouteParamsContext) {
  
  if (!db) return error("DB not configured", 500);
  
  const id = await resolveRouteId(ctx);
  
    if (id == null) return error("Invalid id", 400);

  const [row] = await db.delete(schema.theaters).where(eq(schema.theaters.id, id)).returning();
  
    if (!row) return error("Not found", 404);
  
  return ok({ ok: true });

}
