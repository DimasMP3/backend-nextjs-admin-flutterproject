import { db, schema } from "@/db";
import { ok, okList, error, parsePagination, parseSort, toInt } from "@/lib/http";
import { and, eq, gte, lte, sql } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * Lists showtimes with optional filtering by movie, theater, date, and status.
 */
export async function GET(req: Request) {
  if (!db) return error("DB not configured", 500);

  const url = new URL(req.url);
  
  const params = url.searchParams;
  
  const { page, pageSize, limit, offset } = parsePagination(params);
  
  const movieId = toInt(params.get("movieId"));
  
  const theaterId = toInt(params.get("theaterId"));
  
  const date = params.get("date"); // YYYY-MM-DD
  
  const status = params.get("status");


  let start: string | undefined;
  
  let end: string | undefined;
  
  if (date) {

    start = `${date}T00:00:00.000Z`;
    end = `${date}T23:59:59.999Z`;
  
  }

  // Build dynamic where clause based on provided filters
  const where = and(

    movieId ? eq(schema.showtimes.movieId, movieId) : undefined,
    theaterId ? eq(schema.showtimes.theaterId, theaterId) : undefined,
    status ? eq(schema.showtimes.status, status) : undefined,
    start ? gte(schema.showtimes.startsAt, start) : undefined,
    end ? lte(schema.showtimes.startsAt, end) : undefined
  
  );

  // Determine sorting order
  const order =

    parseSort(params, {
      id: schema.showtimes.id,
      starts_at: schema.showtimes.startsAt,
      movie_id: schema.showtimes.movieId,
      theater_id: schema.showtimes.theaterId,
      status: schema.showtimes.status,
  
    }) || schema.showtimes.startsAt;

  // Fetch data from the database  
  const data = await db

    .select()
    .from(schema.showtimes)
    .where(where)
    .orderBy(order)
    .limit(limit)
    .offset(offset);

  // Fetch total count for pagination metadata  
  const [{ count }] = await db

    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(schema.showtimes)
    .where(where);

  return okList(data, { page, pageSize, total: Number(count ?? data.length) });

}

/**
 * Creates a new showtime entry using the validated request payload.
 */
export async function POST(req: Request) {
  
  if (!db) return error("DB not configured", 500);

  const json = await req.json();
  
  const parsed = (await import("@/lib/validators")).ShowtimeCreate.safeParse(json);
  
    if (!parsed.success) return error("Invalid request", 400, parsed.error.flatten());

  const [row] = await db

    .insert(schema.showtimes)
    .values({
      movieId: parsed.data.movieId,
      theaterId: parsed.data.theaterId,
      startsAt: parsed.data.startsAt,
      lang: parsed.data.lang ?? "ID",
      type: parsed.data.type ?? "2D",
      status: parsed.data.status ?? "scheduled",
    
    })
    
    .returning();
  
    return ok(row, 201);
  
  }
