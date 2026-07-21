import { json } from "@sveltejs/kit";
import { searchCompaniesByName } from "$lib/server/queries";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
  const q = url.searchParams.get("q")?.trim() ?? "";
  const results = await searchCompaniesByName(q);
  return json({ companies: results });
};
