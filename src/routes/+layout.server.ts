import { getUserKarma } from "$lib/server/queries";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    user: locals.user
      ? { id: locals.user.id, name: locals.user.name, email: locals.user.email }
      : null,
    role: locals.role,
    karma: locals.user ? await getUserKarma(locals.user.id) : null,
  };
};
