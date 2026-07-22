import { json, error } from "@sveltejs/kit";
import { setUserRole } from "$lib/server/queries";
import { validate, UserPatchSchema } from "$lib/server/validation";
import type { RequestHandler } from "./$types";

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (locals.role !== "admin") throw error(403, "Forbidden");
  const { role } = validate(UserPatchSchema, await request.json());
  await setUserRole(params.id, role);
  return json({ ok: true });
};
