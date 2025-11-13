import { db, schema } from "@/db";
import { ok, okList, error, parsePagination, parseSort } from "@/lib/http";
import { authenticateRequest } from "@/lib/auth";
import { and, eq, sql } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * Lists fun content cards with pagination, filtering, and sorting support.
 */
export async function GET(req: Request) {
  if (!db) return error("DB not configured", 500);

  const url = new URL(req.url);
  
  const params = url.searchParams;
  
  const { page, pageSize, limit, offset } = parsePagination(params);
  
  const status = params.get("status");
  
  const where = and(status ? eq(schema.funItems.status, status) : undefined);
  
  const order =

    parseSort(params, {
      id: schema.funItems.id,
      title: schema.funItems.title,
      created_at: schema.funItems.createdAt,
      status: schema.funItems.status,

    }) || schema.funItems.id;

  // Fetch data from the database  
  const data = await db

    .select()
    .from(schema.funItems)
    .where(where)
    .orderBy(order)
    .limit(limit)
    .offset(offset);

  // Fetch total count for pagination metadata  
  const [{ count }] = await db

    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(schema.funItems)
    .where(where);

  return okList(data, { page, pageSize, total: Number(count ?? data.length) });

}

/**
 * Creates a new fun item entry. Requires a verified app token.
 */
export async function POST(req: Request) {
  
  if (!db) return error("DB not configured", 500);
  
    if (!authenticateRequest(req)) return error("Unauthorized", 401);

  
  const json = await req.json();
  
  const parsed = (await import("@/lib/validators")).FunCreate.safeParse(json);
  
    if (!parsed.success) return error("Invalid request", 400, parsed.error.flatten());

  // Insert new record into the database  
  const [row] = await db

    .insert(schema.funItems)
    .values({
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      description: parsed.data.description,
      imageAssetId: parsed.data.imageAssetId,
      linkUrl: parsed.data.linkUrl,
      status: parsed.data.status ?? "active",

    })

    .returning();

  return ok(row, 201);

}
