import { db } from "@/db";
import { error, ok } from "@/lib/http";
import { ensureGoogleUser } from "@/lib/users";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

type GooglePayload = {

  sub?: string;
  email?: string;
  name?: string | null;

};

/**
 * Handles Google sign-in requests arriving from the admin panel.
 * It validates the id token, ensures the user exists, and issues a short-lived JWT.
 */
export async function POST(req: Request) {
  
  if (!db) return error("DB not configured", 500);


  const body = await req.json().catch(() => ({}));
  
  const idToken = body?.idToken as string | undefined;
  
    if (!idToken) return error("idToken is required", 400);

  
    const { clientId, secret } = getAuthSecrets();
  
    if (!clientId) return error("Missing GOOGLE_CLIENT_ID", 500);
  
    if (!secret) return error("Missing JWT_SECRET", 500);

// Verify the Google ID token
  const payload = await verifyGoogleToken(clientId, idToken);
  
    if (!payload) return error("Invalid idToken payload", 400);

  
    const sub = payload.sub;
  
    const email = payload.email;
  
    const name = payload.name ?? null;
  
    if (!sub || !email) return error("idToken missing sub/email", 400);

    const user = await ensureGoogleUser({ sub, email, name });
  
    const token = jwt.sign(

      { uid: user.id, email: user.email, name: user.name ?? null, role: user.role },

      secret,

      { expiresIn: "15m" }

  );

  return ok({ token });

}

// Retrieves authentication-related secrets from environment variables.
function getAuthSecrets() {

  return {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    secret: process.env.JWT_SECRET || "",

  };
}

// Verifies the Google ID token and returns the payload if valid.
async function verifyGoogleToken(clientId: string, idToken: string) {
  
  const { OAuth2Client } = await import("google-auth-library");
  
  const oauth = new OAuth2Client(clientId);
  
  const ticket = await oauth.verifyIdToken({ idToken, audience: clientId }).catch(() => null);
  
  return ticket?.getPayload() as GooglePayload | undefined;

}
