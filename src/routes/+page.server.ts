import { queryCompanies } from "$lib/server/queries";
import { validate, CompaniesQuerySchema } from "$lib/server/validation";
import type { PageServerLoad } from "./$types";
import type { Role } from "$lib/server/db/schema";

export const load: PageServerLoad = async ({ url, locals }) => {
  const q = validate(CompaniesQuerySchema, Object.fromEntries(url.searchParams));

  const { rows, hasMore } = await queryCompanies({
    limit: 50,
    sort: q.sort ?? "created_at",
    dir: q.dir ?? "desc",
    q: q.q,
    type: q.type,
    size: q.size,
    country: q.country,
    userId: locals.user?.id,
    userRole: (locals.role as Role) ?? undefined,
  });

  return { companies: rows, hasMore };
};
