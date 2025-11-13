import { z } from "zod";

export const MovieCreate = z.object({
  title: z.string().min(1),
  genre: z.string().optional(),
  durationMin: z.number().int().positive().optional(),
  rating: z.string().optional(),
  status: z.enum(["now_showing", "coming_soon", "archived"]).optional(),
  posterAssetId: z.number().int().positive().optional(),
});

export const MovieUpdate = MovieCreate.partial();

export const TheaterCreate = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  rooms: z.number().int().min(1).optional(),
  seats: z.number().int().min(0).optional(),
});
export const TheaterUpdate = TheaterCreate.partial();

export const ShowtimeCreate = z.object({
  movieId: z.number().int().positive(),
  theaterId: z.number().int().positive(),
  startsAt: z.string().min(1), // ISO string
  lang: z.string().min(1).default("ID").optional(),
  type: z.string().min(1).default("2D").optional(),
  status: z.enum(["scheduled", "completed", "canceled"]).optional(),
});
export const ShowtimeUpdate = ShowtimeCreate.partial();

export const OrderCreate = z.object({
  showtimeId: z.number().int().positive(),
  customer: z.string().min(1),
  seats: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  status: z.enum(["paid", "pending", "refunded"]).optional(),
});
export const OrderUpdate = OrderCreate.partial();

export const UserCreate = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  role: z.enum(["admin", "staff", "customer"]).optional(),
  status: z.enum(["active", "disabled"]).optional(),
});
export const UserUpdate = UserCreate.partial();

// TIX Fun
export const FunCreate = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  imageAssetId: z.number().int().positive().optional(),
  linkUrl: z.string().url().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
});
export const FunUpdate = FunCreate.partial();
