import { db, schema } from "@/db";
import { ok, okList, error, parsePagination, parseSort } from "@/lib/http";
import { and, eq, sql } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * Lists user accounts with pagination plus optional role/status filters.
 */
export async function GET(req: Request) {
  
  if (!db) return error("DB not configured", 500);

  
  const url = new URL(req.url);
  
  const params = url.searchParams;
  
  const { page, pageSize, limit, offset } = parsePagination(params);
  
  const role = params.get("role");
  
  const status = params.get("status");


  const where = and(
  
    role ? eq(schema.users.role, role) : undefined,
    status ? eq(schema.users.status, status) : undefined
  
  );

  const order =

    parseSort(params, {
      id: schema.users.id,
      email: schema.users.email,
      role: schema.users.role,
      status: schema.users.status,
    
    }) || schema.users.id;

    
  const data = await db

    .select()
    .from(schema.users)
    .where(where)
    .orderBy(order)
    .limit(limit)
    .offset(offset);


  const [{ count }] = await db

    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(schema.users)
    .where(where);

  return okList(data, { page, pageSize, total: Number(count ?? data.length) });

}

/**
 * Creates a new user record.
 */
export async function POST(req: Request) {
  
  if (!db) return error("DB not configured", 500);

  const json = await req.json();
  
  const parsed = (await import("@/lib/validators")).UserCreate.safeParse(json);
  
    if (!parsed.success) return error("Invalid request", 400, parsed.error.flatten());

  const [row] = await db

    .insert(schema.users)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role ?? "staff",
      status: parsed.data.status ?? "active",

    })

    .returning();

  return ok(row, 201);
  
}
