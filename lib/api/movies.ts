import { z } from "zod";
import { api } from "./client";

export const Movie = z.object({
  id: z.number(),
  title: z.string(),
  genre: z.string().nullable().optional(),
  durationMin: z.number().nullable().optional(),
  rating: z.string().nullable().optional(),
  status: z.string(),
  createdAt: z.string(),
  posterAssetId: z.number().nullable().optional(),
});

export type Movie = z.infer<typeof Movie>;

const MoviesResponse = z.object({ data: z.array(Movie) });
const MovieResponse = z.object({ data: Movie });

export async function fetchMovies() {

  const json = await api<unknown>("/api/movies");

  const parsed = MoviesResponse.safeParse(json);

  if (!parsed.success) throw new Error(parsed.error.message);

  return parsed.data.data;

}

export async function fetchMovie(id: number) {

  const json = await api<unknown>(`/api/movies/${id}`);

  const parsed = MovieResponse.safeParse(json);

  if (!parsed.success) throw new Error(parsed.error.message);

  return parsed.data.data;

}

export async function createMovie(payload: {
  title: string;
  genre?: string;
  durationMin?: number;
  rating?: string;
  status?: "now_showing" | "coming_soon" | "archived";
  posterAssetId?: number;
}) {

  const json = await api<unknown>("/api/movies", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const parsed = MovieResponse.safeParse(json);

  if (!parsed.success) throw new Error(parsed.error.message);

  return parsed.data.data;

}

export async function updateMovie(id: number, payload: Partial<Omit<Movie, "id" | "createdAt">>) {

  const json = await api<unknown>(`/api/movies/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  const parsed = MovieResponse.safeParse(json);

  if (!parsed.success) throw new Error(parsed.error.message);

  return parsed.data.data;

}

export async function deleteMovie(id: number) {

  await api(`/api/movies/${id}`, { method: "DELETE" });

  return true;

}

export const moviesKeys = {
  all: ["movies"] as const,
  lists: () => [...moviesKeys.all, "list"] as const,
  details: () => [...moviesKeys.all, "detail"] as const,
  detail: (id: number) => [...moviesKeys.details(), id] as const,
};
