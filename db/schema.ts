import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  data: text("data").notNull(), // base64-encoded content
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  genre: text("genre"),
  durationMin: integer("duration_min"),
  rating: text("rating"),
  status: text("status").notNull().default("coming_soon"),
  posterAssetId: integer("poster_asset_id").references(() => assets.id),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const theaters = pgTable("theaters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  rooms: integer("rooms").default(1).notNull(),
  seats: integer("seats").default(0).notNull(),
});

export const showtimes = pgTable("showtimes", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").references(() => movies.id, { onDelete: "cascade" }).notNull(),
  theaterId: integer("theater_id").references(() => theaters.id, { onDelete: "cascade" }).notNull(),
  startsAt: timestamp("starts_at", { mode: "string" }).notNull(),
  lang: text("lang").default("ID").notNull(),
  type: text("type").default("2D").notNull(),
  status: text("status").default("scheduled").notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  showtimeId: integer("showtime_id").references(() => showtimes.id, { onDelete: "cascade" }).notNull(),
  customer: text("customer").notNull(),
  seats: integer("seats").notNull(),
  total: integer("total").notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

// Payment transactions (Midtrans integration)
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().unique(), // Midtrans order ID
  userId: integer("user_id").references(() => users.id),
  showtimeId: integer("showtime_id").references(() => showtimes.id),
  movieTitle: text("movie_title"),
  cinema: text("cinema"),
  seats: text("seats").notNull(), // JSON string of seat codes
  amount: integer("amount").notNull(),
  status: text("status").default("pending").notNull(), // pending, paid, expired, failed
  midtransTransactionId: text("midtrans_transaction_id"),
  paymentType: text("payment_type"), // credit_card, gopay, qris, bank_transfer, etc
  snapToken: text("snap_token"),
  snapRedirectUrl: text("snap_redirect_url"),
  paidAt: timestamp("paid_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  role: text("role").default("staff").notNull(),
  status: text("status").default("active").notNull(),
  googleSub: text("google_sub").unique(),
});

// TIX Fun content items
export const funItems = pgTable("fun_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  imageAssetId: integer("image_asset_id").references(() => assets.id),
  linkUrl: text("link_url"),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const moviesRelations = relations(movies, ({ many }) => ({
  showtimes: many(showtimes),
}));

export const assetsRelations = relations(assets, ({ }) => ({}));

export const theatersRelations = relations(theaters, ({ many }) => ({
  showtimes: many(showtimes),
}));

export const showtimesRelations = relations(showtimes, ({ one, many }) => ({
  movie: one(movies, { fields: [showtimes.movieId], references: [movies.id] }),
  theater: one(theaters, { fields: [showtimes.theaterId], references: [theaters.id] }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  showtime: one(showtimes, { fields: [orders.showtimeId], references: [showtimes.id] }),
}));

export const funItemsRelations = relations(funItems, ({ one }) => ({
  image: one(assets, { fields: [funItems.imageAssetId], references: [assets.id] }),
}));
