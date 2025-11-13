import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export type GoogleProfile = {
  sub: string;
  email: string;
  name: string | null;
};

/**
 * Idempotently finds a user by Google identifiers or creates one if needed.
 */
export async function ensureGoogleUser({ sub, email, name }: GoogleProfile) {
  let [user] = await db.select().from(schema.users).where(eq(schema.users.googleSub, sub));
  if (!user) {
    [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  }

  if (!user) {
    const rows = await db
      .insert(schema.users)
      .values({ name: name ?? email.split("@")[0], email, role: "customer", status: "active", googleSub: sub })
      .returning();
    return rows[0];
  }

  if (!user.googleSub) {
    const rows = await db
      .update(schema.users)
      .set({ googleSub: sub })
      .where(eq(schema.users.id, user.id))
      .returning();
    return rows[0];
  }

  return user;
}
