import { z } from "zod";
import { api } from "./client";

export const FunItem = z.object({
  id: z.number(),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  imageAssetId: z.number().nullable().optional(),
  linkUrl: z.string().nullable().optional(),
  status: z.string(),
  createdAt: z.string(),
});
export type FunItem = z.infer<typeof FunItem>;

const FunListResponse = z.object({ data: z.array(FunItem) });
const FunResponse = z.object({ data: FunItem });

export async function fetchFun(params?: { status?: string }) {
  const query = params?.status ? `?status=${encodeURIComponent(params.status)}` : "";
  const json = await api<unknown>(`/api/fun${query}`);
  const parsed = FunListResponse.safeParse(json);
  if (!parsed.success) throw new Error(parsed.error.message);
  return parsed.data.data;
}

export async function createFun(payload: {
  title: string;
  subtitle?: string;
  description?: string;
  imageAssetId?: number;
  linkUrl?: string;
  status?: "active" | "inactive" | "archived";
}) {
  const json = await api<unknown>("/api/fun", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const parsed = FunResponse.safeParse(json);
  if (!parsed.success) throw new Error(parsed.error.message);
  return parsed.data.data;
}

export async function updateFun(id: number, payload: Partial<Omit<FunItem, "id" | "createdAt">>) {
  const json = await api<unknown>(`/api/fun/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  const parsed = FunResponse.safeParse(json);
  if (!parsed.success) throw new Error(parsed.error.message);
  return parsed.data.data;
}

export async function deleteFun(id: number) {
  await api(`/api/fun/${id}`, { method: "DELETE" });
  return true;
}

export const funKeys = {
  all: ["fun"] as const,
  lists: () => [...funKeys.all, "list"] as const,
  details: () => [...funKeys.all, "detail"] as const,
  detail: (id: number) => [...funKeys.details(), id] as const,
};

