import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { ok, error, resolveRouteId, RouteParamsContext } from "@/lib/http";

export const runtime = "nodejs";

// Define validation schema for movie updates
const MovieUpdate = z.object({

  title: z.string().min(1).optional(),
  genre: z.string().optional(),
  durationMin: z.number().int().positive().optional(),
  rating: z.string().optional(),
  status: z.enum(["now_showing", "coming_soon", "archived"]).optional(),
  posterAssetId: z.number().int().positive().optional(),

});

/**
 * Reads a movie by id.
 */
export async function GET(_: Request, ctx: RouteParamsContext) {
  
  if (!db) return error("DB not configured", 500);
  
  const id = await resolveRouteId(ctx);
  
    if (id == null) return error("Invalid id", 400);

  const [row] = await db.select().from(schema.movies).where(eq(schema.movies.id, id));
  
    if (!row) return error("Not found", 404);
  
  return ok(row);

}

/**
 * Updates movie metadata fields via partial payloads.
 */
export async function PUT(req: Request, ctx: RouteParamsContext) {
  
  if (!db) return error("DB not configured", 500);
  
  const id = await resolveRouteId(ctx);
  
    if (id == null) return error("Invalid id", 400);

  const json = await req.json();
  
  const parsed = MovieUpdate.safeParse(json);
  
    if (!parsed.success) {

      return error("Invalid request", 400, parsed.error.flatten());
  
    }

  const [row] = await db.update(schema.movies).set(parsed.data).where(eq(schema.movies.id, id)).returning();
  
    if (!row) return error("Not found", 404);
  
  return ok(row);

}

/**
 * Deletes a movie, surfacing FK violations with a meaningful message.
 */
export async function DELETE(_: Request, ctx: RouteParamsContext) {
  
  if (!db) return error("DB not configured", 500);
  
  const id = await resolveRouteId(ctx);
  
    if (id == null) return error("Invalid id", 400);

  try {

    const [row] = await db.delete(schema.movies).where(eq(schema.movies.id, id)).returning();
    
      if (!row) return error("Not found", 404);
    
      return ok({ ok: true });

  } catch (err) {

    if (isForeignKeyError(err)) {

      return error("Cannot delete movie: referenced by showtimes. Delete related showtimes first.", 409);
    
    }

    throw err;

  }
}

// Helper to determine if an error is a foreign key violation
function isForeignKeyError(error: unknown): error is { code?: string } {

  return (

    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23503"
  
  );
}
