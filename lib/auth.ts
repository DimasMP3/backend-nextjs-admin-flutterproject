import jwt from "jsonwebtoken";

export type AppJwt = {
  uid: number;
  email: string;
  name: string | null;
  role?: string | null;
  iat?: number;
  exp?: number;
};

export function getBearer(req: Request) {

  const auth = req.headers.get("authorization") || req.headers.get("Authorization");

  if (!auth) return null;

  const m = /^Bearer\s+(.+)$/i.exec(auth);

  return m?.[1] ?? null;

}

export function verifyAppToken(token: string): AppJwt | null {

  try {

    const secret = process.env.JWT_SECRET || "";

    if (!secret) return null;

    return jwt.verify(token, secret) as AppJwt;

  } catch {

    return null;

  }

}

/**
 * Convenience helper that extracts the bearer token and validates it in one call.
 */
export function authenticateRequest(req: Request): AppJwt | null {

  const bearer = getBearer(req);

  return bearer ? verifyAppToken(bearer) : null;

}
