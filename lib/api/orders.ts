import { z } from "zod";
import { api } from "./client";

export const Order = z.object({
  id: z.number(),
  showtimeId: z.number(),
  customer: z.string(),
  seats: z.number(),
  total: z.number(),
  status: z.string(),
  createdAt: z.string(),
});
export type Order = z.infer<typeof Order>;

const ListResponse = z.object({ data: z.array(Order), meta: z.object({ page: z.number(), pageSize: z.number(), total: z.number() }).optional() });
const ItemResponse = z.object({ data: Order });

export async function fetchOrders(params?: { showtimeId?: number; status?: string; page?: number; limit?: number; sort?: string }) {
  const qs = new URLSearchParams();
  if (params?.showtimeId) qs.set("showtimeId", String(params.showtimeId));
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.sort) qs.set("sort", params.sort);
  const json = await api<unknown>(`/api/orders${qs.toString() ? `?${qs.toString()}` : ""}`);
  const parsed = ListResponse.safeParse(json);
  if (!parsed.success) throw new Error(parsed.error.message);
  return parsed.data.data;
}

export async function createOrder(payload: { showtimeId: number; customer: string; seats: number; total: number; status?: string }) {
  const json = await api<unknown>("/api/orders", { method: "POST", body: JSON.stringify(payload) });
  const parsed = ItemResponse.safeParse(json);
  if (!parsed.success) throw new Error(parsed.error.message);
  return parsed.data.data;
}

export async function deleteOrder(id: number) {
  await api(`/api/orders/${id}`, { method: "DELETE" });
  return true;
}

export const ordersKeys = {
  all: ["orders"] as const,
  lists: () => [...ordersKeys.all, "list"] as const,
  detail: (id: number) => [...ordersKeys.all, "detail", id] as const,
};

