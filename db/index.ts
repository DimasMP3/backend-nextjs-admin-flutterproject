import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Drizzle will not be initialized.");
}

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : undefined;

export const db: NeonHttpDatabase<typeof schema> | undefined = sql
  ? drizzle(sql, { schema })
  : undefined;
export { schema };
