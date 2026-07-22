import { json } from "@sveltejs/kit";
import { searchCompaniesByName } from "$lib/server/queries";
import { validate, SearchQuerySchema } from "$lib/server/validation";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const { q } = validate(SearchQuerySchema, Object.fromEntries(url.searchParams));
  const results = await searchCompaniesByName(q ?? "");
  return json(
    { companies: results },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
  );
};
