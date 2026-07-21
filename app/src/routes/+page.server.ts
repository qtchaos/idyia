import { queryCompanies, COMPANY_SIZE_LABELS } from "$lib/server/queries";
import type { PageServerLoad } from "./$types";
import type { Role } from "$lib/server/db/schema";
import type { SortField, SortDir } from "$lib/server/queries";

export const load: PageServerLoad = async ({ url, locals }) => {
  const limit = 50;
  const sort = (url.searchParams.get("sort") ?? "created_at") as SortField;
  const dir = (url.searchParams.get("dir") ?? "desc") as SortDir;
  const q = url.searchParams.get("q") ?? undefined;

  const { rows, hasMore } = await queryCompanies({
    limit,
    sort,
    dir,
    q,
    type: url.searchParams.get("type") ?? undefined,
    size: url.searchParams.get("size") ?? undefined,
    userId: locals.user?.id,
    userRole: (locals.role as Role) ?? undefined,
  });

  return {
    companies: rows,
    hasMore,
    sizeLabels: COMPANY_SIZE_LABELS,
  };
};
