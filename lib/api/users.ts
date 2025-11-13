import { z } from "zod";
import { api } from "./client";

export const User = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
  email: z.string(),
  role: z.string(),
  status: z.string(),
});
export type User = z.infer<typeof User>;

const ListResponse = z.object({ data: z.array(User), meta: z.object({ page: z.number(), pageSize: z.number(), total: z.number() }).optional() });
const ItemResponse = z.object({ data: User });

export async function fetchUsers(params?: { role?: string; status?: string; page?: number; limit?: number; sort?: string }) {
  const qs = new URLSearchParams();
  if (params?.role) qs.set("role", params.role);
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.sort) qs.set("sort", params.sort);
  const json = await api<unknown>(`/api/users${qs.toString() ? `?${qs.toString()}` : ""}`);
  const parsed = ListResponse.safeParse(json);
  if (!parsed.success) throw new Error(parsed.error.message);
  return parsed.data.data;
}

export async function createUser(payload: { name?: string; email: string; role?: string; status?: string }) {
  const json = await api<unknown>("/api/users", { method: "POST", body: JSON.stringify(payload) });
  const parsed = ItemResponse.safeParse(json);
  if (!parsed.success) throw new Error(parsed.error.message);
  return parsed.data.data;
}

export async function deleteUser(id: number) {
  await api(`/api/users/${id}`, { method: "DELETE" });
  return true;
}

export const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  detail: (id: number) => [...usersKeys.all, "detail", id] as const,
};

