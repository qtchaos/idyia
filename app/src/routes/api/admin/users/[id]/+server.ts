import { json, error } from "@sveltejs/kit";
import { setUserRole } from "$lib/server/queries";
import type { Role } from "$lib/server/db/schema";
import type { RequestHandler } from "./$types";

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (locals.role !== "admin") throw error(403, "Forbidden");
  const { role } = (await request.json()) as { role: Role };
  await setUserRole(params.id, role);
  return json({ ok: true });
};
