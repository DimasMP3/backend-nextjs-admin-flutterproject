import { z } from "zod";
import { api } from "./client";

export const Theater = z.object({
  id: z.number(),
  name: z.string(),
  location: z.string(),
  rooms: z.number(),
  seats: z.number(),
});
export type Theater = z.infer<typeof Theater>;

const ListResponse = z.object({ data: z.array(Theater), meta: z.object({ page: z.number(), pageSize: z.number(), total: z.number() }).optional() });
const ItemResponse = z.object({ data: Theater });

export async function fetchTheaters(params?: { page?: number; limit?: number; location?: string; sort?: string }) {

  const qs = new URLSearchParams();

  if (params?.page) qs.set("page", String(params.page));

  if (params?.limit) qs.set("limit", String(params.limit));

  if (params?.location) qs.set("location", params.location);

  if (params?.sort) qs.set("sort", params.sort);

  const json = await api<unknown>(`/api/theaters${qs.toString() ? `?${qs.toString()}` : ""}`);

  const parsed = ListResponse.safeParse(json);

  if (!parsed.success) throw new Error(parsed.error.message);

  return parsed.data.data;

}

export async function createTheater(payload: { name: string; location: string; rooms?: number; seats?: number }) {

  const json = await api<unknown>("/api/theaters", { method: "POST", body: JSON.stringify(payload) });

  const parsed = ItemResponse.safeParse(json);

  if (!parsed.success) throw new Error(parsed.error.message);

  return parsed.data.data;

}

export async function deleteTheater(id: number) {

  await api(`/api/theaters/${id}`, { method: "DELETE" });

  return true;

}

export const theatersKeys = {
  all: ["theaters"] as const,
  lists: () => [...theatersKeys.all, "list"] as const,
  detail: (id: number) => [...theatersKeys.all, "detail", id] as const,
};
