import { db, schema } from "@/db";
import { and, eq, sql } from "drizzle-orm";
import { ok, okList, error, parsePagination, parseSort } from "@/lib/http";

export const runtime = "nodejs";

/**
 * Lists theaters with pagination and optional filtering by location.
 */
export async function GET(req: Request) {
  
  if (!db) return error("DB not configured", 500);

  
  const url = new URL(req.url);
  
  const params = url.searchParams;
  
  const { page, pageSize, limit, offset } = parsePagination(params);
  
  const location = params.get("location");

  
  const where = and(location ? eq(schema.theaters.location, location) : undefined);
  
  const order =

    parseSort(params, {
      id: schema.theaters.id,
      name: schema.theaters.name,
      location: schema.theaters.location,
      rooms: schema.theaters.rooms,
      seats: schema.theaters.seats,

    }) || schema.theaters.id;


  const data = await db

    .select()
    .from(schema.theaters)
    .where(where)
    .orderBy(order)
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db

    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(schema.theaters)
    .where(where);

    return okList(data, { page, pageSize, total: Number(count ?? data.length) });

}  

/**
 * Creates a theater entry.
 */
export async function POST(req: Request) {
  
  if (!db) return error("DB not configured", 500);

  const json = await req.json();
  
  const parsed = (await import("@/lib/validators")).TheaterCreate.safeParse(json);
  
    if (!parsed.success) return error("Invalid request", 400, parsed.error.flatten());

    const [row] = await db

    .insert(schema.theaters)
    .values({
      name: parsed.data.name,
      location: parsed.data.location,
      rooms: parsed.data.rooms ?? 1,
      seats: parsed.data.seats ?? 0,

    })

    .returning();
  
    return ok(row, 201);

}  
