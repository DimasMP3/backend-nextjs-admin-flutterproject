import { z } from "zod";
import { api } from "./client";

export const Showtime = z.object({
  id: z.number(),
  movieId: z.number(),
  theaterId: z.number(),
  startsAt: z.string(),
  lang: z.string(),
  type: z.string(),
  status: z.string(),
});
export type Showtime = z.infer<typeof Showtime>;

const ListResponse = z.object({ data: z.array(Showtime), meta: z.object({ page: z.number(), pageSize: z.number(), total: z.number() }).optional() });
const ItemResponse = z.object({ data: Showtime });

export async function fetchShowtimes(params?: { movieId?: number; theaterId?: number; date?: string; page?: number; limit?: number }) {

  const qs = new URLSearchParams();

  if (params?.movieId) qs.set("movieId", String(params.movieId));

  if (params?.theaterId) qs.set("theaterId", String(params.theaterId));

  if (params?.date) qs.set("date", params.date);

  if (params?.page) qs.set("page", String(params.page));

  if (params?.limit) qs.set("limit", String(params.limit));

  const json = await api<unknown>(`/api/showtimes${qs.toString() ? `?${qs.toString()}` : ""}`);

  const parsed = ListResponse.safeParse(json);

  if (!parsed.success) throw new Error(parsed.error.message);

  return parsed.data.data;

}

export async function createShowtime(payload: { movieId: number; theaterId: number; startsAt: string; lang?: string; type?: string; status?: string }) {

  const json = await api<unknown>("/api/showtimes", { method: "POST", body: JSON.stringify(payload) });

  const parsed = ItemResponse.safeParse(json);

  if (!parsed.success) throw new Error(parsed.error.message);

  return parsed.data.data;

}

export async function deleteShowtime(id: number) {

  await api(`/api/showtimes/${id}`, { method: "DELETE" });

  return true;

}

export const showtimesKeys = {
  all: ["showtimes"] as const,
  lists: () => [...showtimesKeys.all, "list"] as const,
  detail: (id: number) => [...showtimesKeys.all, "detail", id] as const,
};
