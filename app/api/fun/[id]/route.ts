import { db, schema } from "@/db";
import { ok, error, resolveRouteId, RouteParamsContext } from "@/lib/http";
import { authenticateRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * Reads a single fun item entry by id.
 */
export async function GET(_req: Request, ctx: RouteParamsContext) {
  
  if (!db) return error("DB not configured", 500);

  const id = await resolveRouteId(ctx);
    
    if (id == null) return error("Invalid id", 400);

    const [row] = await db.select().from(schema.funItems).where(eq(schema.funItems.id, id));
  
    if (!row) return error("Not found", 404);
  
    return ok(row);

}

/**
 * Updates an existing fun item. Requires a valid admin token.
 */
export async function PUT(req: Request, ctx: RouteParamsContext) {
  
  if (!db) return error("DB not configured", 500);
    
    if (!authenticateRequest(req)) return error("Unauthorized", 401);
  
    const id = await resolveRouteId(ctx);
  
    if (id == null) return error("Invalid id", 400);

    // Parse and validate request body
    const json = await req.json();
  
    const parsed = (await import("@/lib/validators")).FunUpdate.safeParse(json);
  
    if (!parsed.success) return error("Invalid request", 400, parsed.error.flatten());

    const [row] = await db.update(schema.funItems).set(parsed.data).where(eq(schema.funItems.id, id)).returning();
  
    return ok(row);
}

/**
 * Deletes a fun entry. Requires a valid admin token to avoid accidental removal.
 */
export async function DELETE(req: Request, ctx: RouteParamsContext) {
  
  if (!db) return error("DB not configured", 500);
    
    if (!authenticateRequest(req)) return error("Unauthorized", 401);
  
    const id = await resolveRouteId(ctx);
  
    if (id == null) return error("Invalid id", 400);

  // Perform deletion  
  await db.delete(schema.funItems).where(eq(schema.funItems.id, id));
  
  return ok({ id });

}
