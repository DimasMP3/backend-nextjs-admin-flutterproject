import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql as raw } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * Simple liveness/readiness probe that confirms DB connectivity.
 */
export async function GET() {
  
  try {
    
    if (!db) {
      
      return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 500 });
    
    }
    
    // Simple query to ensure connectivity
    const res = await db.execute(raw`select 1 as ok`);
    
    return NextResponse.json({ ok: true, res });

  } catch (err) {

    console.error(err);
    
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  
  }
}
