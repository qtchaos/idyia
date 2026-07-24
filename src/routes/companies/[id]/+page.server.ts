import {
  getCompanyById,
  getAlternativesForCompany,
  addAlternative,
  deleteAlternative,
  updateAlternative,
  submitAlternativeSuggestion,
} from "$lib/server/queries";
import { error, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import type { Role } from "$lib/server/db/schema";
import { db } from "$lib/server/db/index";
import { alternatives } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

/** Validate that a URL is domain-only (no path, query, or hash). */
function originOnly(raw: string): { ok: true; url: string } | { ok: false; error: string } {
  let parsed: URL;
  try { parsed = new URL(raw); } catch {
    return { ok: false, error: "Please enter a valid URL." };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "Only http:// and https:// URLs are allowed." };
  }
  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    return { ok: false, error: "Only the domain is allowed — remove any path or query parameters (e.g. https://example.com)." };
  }
  return { ok: true, url: parsed.origin };
}

export const load: PageServerLoad = async ({ params, locals }) => {
  const company = await getCompanyById(params.id);
  if (!company) error(404, "Company not found");

  const alts = await getAlternativesForCompany(company.id, {
    userId: locals.user?.id,
    role: locals.role as Role | undefined,
  });

  return { company, alternatives: alts };
};

export const actions: Actions = {
  addAlternative: async ({ request, locals, params }) => {
    if (!locals.user) return fail(401, { altError: "You must be signed in to add alternatives." });

    const data = await request.formData();
    const rawUrl = (data.get("url")  as string | null)?.trim() ?? "";
    const name   = (data.get("name") as string | null)?.trim() || null;

    if (!rawUrl) return fail(400, { altError: "A URL is required." });
    const urlResult = originOnly(rawUrl);
    if (!urlResult.ok) return fail(400, { altError: urlResult.error });
    const url = urlResult.url;

    const company = await getCompanyById(params.id);
    if (!company) error(404, "Company not found");

    const isTrusted =
      locals.role === "trusted_contributor" ||
      locals.role === "moderator" ||
      locals.role === "admin";

    const result = await addAlternative(company.id, url, name, locals.user.id, isTrusted);
    if (result.duplicate) return fail(409, { altError: "This URL is already listed as an alternative." });

    return { altSuccess: true };
  },

  deleteAlternative: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { altError: "Unauthenticated." });

    const id = (await request.formData()).get("id")?.toString();
    if (!id) return fail(400, { altError: "Missing id." });

    // Only mod/admin may directly delete
    if (locals.role !== "moderator" && locals.role !== "admin") return fail(403, { altError: "Not allowed." });

    const alt = await db.select().from(alternatives).where(eq(alternatives.id, id)).get();
    if (!alt) return fail(404, { altError: "Not found." });

    await deleteAlternative(id);
    return { altSuccess: true };
  },

  editAlternative: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { altError: "Unauthenticated." });

    const data = await request.formData();
    const id   = data.get("id")?.toString() ?? "";
    const rawUrl = (data.get("url")  as string | null)?.trim() ?? "";
    const name   = (data.get("name") as string | null)?.trim() || null;

    if (!id)     return fail(400, { altError: "Missing id." });
    if (!rawUrl) return fail(400, { altError: "A URL is required." });
    const urlResult = originOnly(rawUrl);
    if (!urlResult.ok) return fail(400, { altError: urlResult.error });
    const url = urlResult.url;

    // Only mod/admin may directly edit
    if (locals.role !== "moderator" && locals.role !== "admin") return fail(403, { altError: "Not allowed." });

    const alt = await db.select().from(alternatives).where(eq(alternatives.id, id)).get();
    if (!alt) return fail(404, { altError: "Not found." });

    await updateAlternative(id, url, name);
    return { altSuccess: true };
  },

  suggestEdit: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { altError: "You must be signed in to suggest edits." });

    const data = await request.formData();
    const id   = data.get("id")?.toString() ?? "";
    const rawUrl = (data.get("url")  as string | null)?.trim() ?? "";
    const name   = (data.get("name") as string | null)?.trim() || undefined;
    const note   = (data.get("note") as string | null)?.trim() ?? "";

    if (!id)     return fail(400, { altError: "Missing id." });
    if (!rawUrl) return fail(400, { altError: "A URL is required." });
    const urlResult = originOnly(rawUrl);
    if (!urlResult.ok) return fail(400, { altError: urlResult.error });
    const url = urlResult.url;
    if (!note)   return fail(400, { altError: "A reason is required." });

    const alt = await db.select().from(alternatives).where(eq(alternatives.id, id)).get();
    if (!alt) return fail(404, { altError: "Not found." });

    await submitAlternativeSuggestion({ alternativeId: id, submittedBy: locals.user.id, type: "edit", note, urlAfter: url, nameAfter: name });
    return { altSuccess: true };
  },

  suggestRemove: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { altError: "You must be signed in to suggest removals." });

    const data = await request.formData();
    const id   = data.get("id")?.toString() ?? "";
    const note = (data.get("note") as string | null)?.trim() ?? "";

    if (!id)   return fail(400, { altError: "Missing id." });
    if (!note) return fail(400, { altError: "A reason is required." });

    const alt = await db.select().from(alternatives).where(eq(alternatives.id, id)).get();
    if (!alt) return fail(404, { altError: "Not found." });

    await submitAlternativeSuggestion({ alternativeId: id, submittedBy: locals.user.id, type: "remove", note });
    return { altSuccess: true };
  },
};
