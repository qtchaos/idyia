import { json } from "@sveltejs/kit";
import { queryCompanies } from "$lib/server/queries";
import { validate, CompaniesQuerySchema } from "$lib/server/validation";
import type { RequestHandler } from "./$types";
import type { Role } from "$lib/server/db/schema";

export const GET: RequestHandler = async ({ url, locals }) => {
  const q = validate(CompaniesQuerySchema, Object.fromEntries(url.searchParams));
  const authed = !!locals.user;

  const data = await queryCompanies({
    limit: q.limit ?? 50,
    offset: q.offset ?? 0,
    sort: q.sort ?? "created_at",
    dir: q.dir ?? "desc",
    q: q.q,
    type: q.type,
    size: q.size,
    country: q.country,
    userId: locals.user?.id,
    userRole: (locals.role as Role) ?? undefined,
  });

  return json(data, {
    headers: {
      "Cache-Control": authed
        ? "private, no-store"
        : "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
};
