import { NextResponse } from "next/server";
import { asc, desc, SQL } from "drizzle-orm";
import type { AnyColumn, SQLWrapper } from "drizzle-orm";

export type ListMeta = { page: number; pageSize: number; total: number };
type RouteParam = { id: string };
export type RouteParamsContext = { params: Promise<RouteParam> };

export function ok<T>(data: T, init?: number | ResponseInit) {

  return NextResponse.json({ data }, typeof init === "number" ? { status: init } : init);

}

export function okList<T>(data: T, meta: ListMeta) {

  return NextResponse.json({ data, meta });

}

export function error(message: string, status = 400, details?: unknown) {

  return NextResponse.json({ error: message, details }, { status });

}

export function parsePagination(params: URLSearchParams) {

  const page = clampInt(params.get("page"), 1) || 1;

  const pageSize = clampInt(params.get("limit") ?? params.get("pageSize"), 1, 100) || 20;

  const offset = (page - 1) * pageSize;

  const limit = pageSize;

  return { page, pageSize, offset, limit };

}

export function parseSort(
  params: URLSearchParams,
  allowed: Record<string, AnyColumn | SQLWrapper>
): SQL | undefined {

  const sort = params.get("sort");

  if (!sort) return undefined;

  const [field, dirRaw] = sort.split(":");

  const col = allowed[field];

  if (!col) return undefined;

  const dir = (dirRaw || "asc").toLowerCase();

  return dir === "desc" ? (desc(col) as unknown as SQL) : (asc(col) as unknown as SQL);

}

export function clampInt(v: string | number | null, min?: number, max?: number) {

  if (v == null) return undefined as unknown as number | undefined;

  const n = typeof v === "number" ? Math.trunc(v) : Math.trunc(Number(v));

  if (Number.isNaN(n)) return undefined as unknown as number | undefined;

  const lo = min ?? -Infinity;

  const hi = max ?? Infinity;

  return Math.max(lo, Math.min(hi, n));

}

export function toInt(v: string | null | undefined) {

  if (v == null) return undefined;

  const n = Number(v);

  return Number.isFinite(n) ? Math.trunc(n) : undefined;

}

/**
 * Normalizes the `id` param coming from Next.js route handlers.
 * Works with both synchronous objects and the historical `Promise`-based `params`.
 */
export async function resolveRouteId(ctx: RouteParamsContext): Promise<number | undefined> {

  const params = await Promise.resolve(ctx.params);

  const parsed = Number(params.id);

  return Number.isFinite(parsed) ? parsed : undefined;

}
