import { error } from "@/lib/http";
import { webcrypto as crypto } from "node:crypto";

export const runtime = "nodejs";

/**
 * Generates a cryptographically strong base64url random string.
 */
function randomBase64Url(len = 32) {

  const buf = Buffer.alloc(len);
  
  crypto.getRandomValues(buf);
  
  return buf

    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

}


/**
 * Produces the PKCE challenge (SHA-256 + base64url) for a given verifier.
 */
async function sha256Base64Url(input: string) {
 
  const data = new TextEncoder().encode(input);
 
  const hash = await crypto.subtle.digest("SHA-256", data);
 
  const b64 = Buffer.from(hash).toString("base64");
 
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

}

/**
 * Starts the mobile OAuth flow by creating a PKCE verifier, embedding it in state,
 * and redirecting the device browser to Google's auth endpoint.
 */
export async function GET(req: Request) {
  
  const url = new URL(req.url);
  
  const redirectUri = url.searchParams.get("redirect_uri");
    
    if (!redirectUri) return error("redirect_uri is required", 400);
  
    // Validate expected app deep-link strictly
      if (!/^santix:\/\/auth-callback$/i.test(redirectUri)) {
    
        return error("Invalid redirect_uri (expected santix://auth-callback)", 400);

  }

  // Prepare OAuth parameters
  
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
    
    if (!clientId) return error("Missing GOOGLE_CLIENT_ID", 500);

  // PKCE
  const codeVerifier = randomBase64Url(48);
  
  const codeChallenge = await sha256Base64Url(codeVerifier);

  // Encode state as compact string: base64url(JSON)
  const payload = { r: redirectUri, v: codeVerifier, t: Date.now() };
  
  const state = Buffer.from(JSON.stringify(payload))

    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  const callback = new URL("/api/auth/mobile/callback", url.origin);

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  authUrl.searchParams.set("client_id", clientId);
 
  authUrl.searchParams.set("redirect_uri", callback.toString());
  
  authUrl.searchParams.set("response_type", "code");
  
  authUrl.searchParams.set("scope", "openid email profile");
  
  authUrl.searchParams.set("code_challenge", codeChallenge);
  
  authUrl.searchParams.set("code_challenge_method", "S256");
  
  authUrl.searchParams.set("state", state);
  
  authUrl.searchParams.set("prompt", "select_account");

  // Redirect to Google's OAuth 2.0 authorization endpoint
  return Response.redirect(authUrl.toString(), 302);

}
