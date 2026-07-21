import { json } from "@sveltejs/kit";
import { queryCompanies } from "$lib/server/queries";
import type { RequestHandler } from "./$types";
import type { SortField, SortDir } from "$lib/server/queries";
import type { Role } from "$lib/server/db/schema";

export const GET: RequestHandler = async ({ url, locals }) => {
  const limit  = Math.min(Number(url.searchParams.get("limit")  ?? "50"), 100);
  const offset = Number(url.searchParams.get("offset") ?? "0");
  const sort   = (url.searchParams.get("sort") ?? "created_at") as SortField;
  const dir    = (url.searchParams.get("dir")  ?? "desc") as SortDir;
  const q      = url.searchParams.get("q") ?? undefined;

  const data = await queryCompanies({
    limit,
    offset,
    sort,
    dir,
    q,
    type: url.searchParams.get("type") ?? undefined,
    size: url.searchParams.get("size") ?? undefined,
    userId: locals.user?.id,
    userRole: (locals.role as Role) ?? undefined,
  });

  return json(data);
};
