import { db } from "@/db";
import { error } from "@/lib/http";
import { ensureGoogleUser } from "@/lib/users";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

/**
 * Decodes base64url encoded JSON payloads safely.
 */
function b64urlToJson<T = unknown>(b64url: string): T | null {

  try {

    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");

    const json = Buffer.from(b64, "base64").toString("utf8");

    return JSON.parse(json);

  } catch {

    return null;

  }

}

/**
 * Completes the OAuth handoff by exchanging the authorization code and issuing an app token.
 */
export async function GET(req: Request) {

  if (!db) return error("DB not configured", 500);

  const url = new URL(req.url);

  const code = url.searchParams.get("code");
  
  const state = url.searchParams.get("state");

    if (!code || !state) return error("Missing code/state", 400);

    const parsed = b64urlToJson<{ r: string; v: string; t: number }>(state);

    if (!parsed?.r || !parsed?.v) return error("Invalid state", 400);

  
    const clientId = process.env.GOOGLE_CLIENT_ID || "";
  
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

    if (!clientId) return error("Missing GOOGLE_CLIENT_ID", 500);

  const callback = new URL("/api/auth/mobile/callback", url.origin).toString();


  // Exchange code for tokens
  const body = new URLSearchParams({

    code,
    client_id: clientId,
    redirect_uri: callback,
    grant_type: "authorization_code",
    code_verifier: parsed.v,

  });

  // Include client secret if available
  if (clientSecret) body.set("client_secret", clientSecret);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {

    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,

  });

  // Handle token exchange failure
  if (!tokenRes.ok) {

    const txt = await tokenRes.text();
    return error(`Token exchange failed: ${txt}`, 400);

  }

  // Parse token response
  type GoogleTokenResponse = { id_token?: string };

  const tokenJson = (await tokenRes.json()) as GoogleTokenResponse;
  const idToken = tokenJson.id_token as string | undefined;

  if (!idToken) return error("Missing id_token", 400);

  // Decode the ID token (basic decode)
  const payloadPart = idToken.split(".")[1];

  type GoogleIdTokenClaims = { sub?: string; email?: string; name?: string };

  const claims = b64urlToJson<GoogleIdTokenClaims>(payloadPart) || {};
  
  const sub: string | undefined = claims.sub;
  
  const email: string | undefined = claims.email;
  
  const name: string | undefined = claims.name;

    if (!sub || !email) return error("Invalid id token claims", 400);

    const user = await ensureGoogleUser({ sub, email, name: name ?? null });

  // Issue app JWT
  const secret = process.env.JWT_SECRET || "";

   if (!secret) return error("Missing JWT_SECRET", 500);

  // Create app token 
  const appToken = jwt.sign(

    { uid: user.id, email: user.email, name: user.name ?? null, role: user.role },
    secret,

    { expiresIn: "15m" }

  );

  const returnUrl = sanitizeRedirect(parsed.r);

  returnUrl.searchParams.set("token", appToken);

  // Safe logs for debugging handoff (no secret leakage)
  try {

    console.log(

      "CALLBACK_USER",
      `email=${email ?? "-"} sub=${String(sub).slice(0, 8)}...`

    );

    // Log redirect URL without full token
    console.log(

      "CALLBACK_REDIRECT",
      `${returnUrl.protocol}//${returnUrl.host}${returnUrl.pathname}?token=${appToken.slice(0, 12)}...`
      
    );

  } catch {}

  return Response.redirect(returnUrl.toString(), 302);

}

/**
 * Guards against malicious redirect targets by forcing the santix://auth-callback origin.
 */
function sanitizeRedirect(target: string) {

  try {

    const url = new URL(target);

    if (url.protocol !== "santix:" || url.host !== "auth-callback") {
      return new URL("santix://auth-callback");
    }

    return url;

  } catch {

    return new URL("santix://auth-callback");

  }

}
