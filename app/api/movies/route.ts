import { db, schema } from "@/db";
import { ok, okList, error, parsePagination, parseSort } from "@/lib/http";
import { and, eq, sql } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * Lists movies with optional status filtering and smart pagination metadata.
 */
export async function GET(req: Request) {
  if (!db) return error("DB not configured", 500);

  const url = new URL(req.url);
  
  const params = url.searchParams;
  
  const { page, pageSize, limit, offset } = parsePagination(params);
  
  const status = params.get("status") as "now_showing" | "coming_soon" | "archived" | null;
  
  const where = and(status ? eq(schema.movies.status, status) : undefined);
  
  const order =

    parseSort(params, {

      id: schema.movies.id,
      title: schema.movies.title,
      created_at: schema.movies.createdAt,
      status: schema.movies.status,

    }) || schema.movies.id;

  // Fetch data from the database  
  const data = await db

    .select()
    .from(schema.movies)
    .where(where)
    .orderBy(order)
    .limit(limit)
    .offset(offset);

  // Fetch total count for pagination metadata  
  const [{ count }] = await db

    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(schema.movies)
    .where(where);

  return okList(data, { page, pageSize, total: Number(count ?? data.length) });

}

/**
 * Creates a new movie entry after validating the payload with Zod.
 */
export async function POST(req: Request) {
  if (!db) return error("DB not configured", 500);

  const json = await req.json();
  
  const parsed = (await import("@/lib/validators")).MovieCreate.safeParse(json);
  
  if (!parsed.success) {

    return error("Invalid request", 400, parsed.error.flatten());

  }

  const [row] = await db

    .insert(schema.movies)
    .values({
      title: parsed.data.title,
      genre: parsed.data.genre,
      durationMin: parsed.data.durationMin,
      rating: parsed.data.rating,
      status: parsed.data.status ?? "coming_soon",
      posterAssetId: parsed.data.posterAssetId,

    })
    
    .returning();

  return ok(row, 201);

}
