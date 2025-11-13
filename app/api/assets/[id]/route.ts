import { db, schema } from "@/db";
import { error, resolveRouteId } from "@/lib/http";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * Streams a single binary asset back to the caller with correct headers.
 */
export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  
  if (!db) return error("DB not configured", 500);

  const id = await resolveRouteId(ctx);
    
    if (id == null) return error("Invalid id", 400);

  const [row] = await db.select().from(schema.assets).where(eq(schema.assets.id, id));
    
    if (!row) return error("Not found", 404);

  // Prepare response headers
  const headers = new Headers();
  
  headers.set("Content-Type", row.contentType);
  
  headers.set("Content-Length", String(row.size));
  
  headers.set("Cache-Control", "public, max-age=31536000, immutable");


  const buf = Buffer.from(row.data, "base64");
  
  return new Response(buf, { headers });

}
