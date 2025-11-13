import { db, schema } from "@/db";
import { ok, error, resolveRouteId, RouteParamsContext } from "@/lib/http";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * Returns a single user row.
 */
export async function GET(_: Request, ctx: RouteParamsContext) {
  
  if (!db) return error("DB not configured", 500);
  
  const id = await resolveRouteId(ctx);
  
    if (id == null) return error("Invalid id", 400);

  const [row] = await db.select().from(schema.users).where(eq(schema.users.id, id));
  
    if (!row) return error("Not found", 404);
  
    return ok(row);

}  

/**
 * Updates an existing user entry.
 */
export async function PUT(req: Request, ctx: RouteParamsContext) {
  
  if (!db) return error("DB not configured", 500);
  
  const id = await resolveRouteId(ctx);
  
    if (id == null) return error("Invalid id", 400);

  const json = await req.json();
  
  const parsed = (await import("@/lib/validators")).UserUpdate.safeParse(json);
  
    if (!parsed.success) return error("Invalid request", 400, parsed.error.flatten());

  const [row] = await db.update(schema.users).set(parsed.data).where(eq(schema.users.id, id)).returning();
  
    if (!row) return error("Not found", 404);
  
    return ok(row);

}

/**
 * Deletes a user entry.
 */
export async function DELETE(_: Request, ctx: RouteParamsContext) {
  
  if (!db) return error("DB not configured", 500);
  
  const id = await resolveRouteId(ctx);
  
    if (id == null) return error("Invalid id", 400);

  const [row] = await db.delete(schema.users).where(eq(schema.users.id, id)).returning();
  
    if (!row) return error("Not found", 404);
  
  return ok({ ok: true });

}
