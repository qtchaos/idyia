import { json, error } from "@sveltejs/kit";
import { db } from "$lib/server/db/index";
import { companies } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { updateCompanyStatus } from "$lib/server/queries";
import { validate, CompanyPatchSchema } from "$lib/server/validation";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals }) => {
  const row = await db.select().from(companies).where(eq(companies.id, params.id)).get();
  if (!row) throw error(404, "Not found");

  const role = locals.role;
  const userId = locals.user?.id;

  const visible =
    row.status === "approved" ||
    role === "moderator" ||
    role === "admin" ||
    ((role === "contributor" || role === "trusted_contributor") && row.submittedBy === userId);

  // Use 404 rather than 403 to avoid leaking existence of non-public entries
  if (!visible) throw error(404, "Not found");

  const headers: Record<string, string> =
    row.status === "approved" && !userId
      ? { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" }
      : { "Cache-Control": "private, no-store" };

  return json(row, { headers });
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (locals.role !== "moderator" && locals.role !== "admin") throw error(403, "Forbidden");

  const body = validate(CompanyPatchSchema, await request.json());

  if (body.status) {
    await updateCompanyStatus(params.id, body.status);
    return json({ ok: true });
  }

  const fieldKeys = [
    "name",
    "registeredName",
    "registryUrl",
    "website",
    "companyType",
    "description",
    "companySize",
    "country",
    "imageUrl",
    "imageOrigin",
  ] as const;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of fieldKeys) {
    if (key in body && body[key] !== undefined) updates[key] = body[key];
  }

  await db.update(companies).set(updates).where(eq(companies.id, params.id));
  return json({ ok: true });
};
