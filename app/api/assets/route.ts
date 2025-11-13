import { db, schema } from "@/db";
import { error, ok } from "@/lib/http";

export const runtime = "nodejs";

/**
 * Stores an uploaded binary as a DB-backed asset and returns the generated asset id.
 */
export async function POST(req: Request) {
  
  if (!db) return error("DB not configured", 500);


  const form = await req.formData();
  
  const file = getFileFromForm(form);
  
    if (!file) return error("Invalid file", 400);

  
    const buffer = Buffer.from(await file.arrayBuffer());
  
    const [row] = await db
  
    .insert(schema.assets)
    .values({
      filename: file.name || "upload",
      contentType: file.type || "application/octet-stream",
      size: buffer.byteLength,
      data: buffer.toString("base64"),

    })

    .returning();

  return ok({ id: row.id }, 201);

}

/**
 * Extracts the `file` field from a multipart form while guarding against invalid values.
 */
function getFileFromForm(form: FormData) {
  
  const file = form.get("file");
  
  return file instanceof File ? file : null;
  
}
