import { error } from "@sveltejs/kit";
import {
  getPendingCompanies,
  getPendingAmendments,
  getPendingAlternatives,
  getPendingAlternativeSuggestions,
  updateCompanyStatus,
  updateAmendmentStatus,
  updateAlternativeStatus,
  updateAlternativeSuggestionStatus,
  deleteAlternative,
} from "$lib/server/queries";
import { db } from "$lib/server/db/index";
import { companies } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async () => {
  const [pending, amendments, altsPending, altSuggestions] = await Promise.all([
    getPendingCompanies(),
    getPendingAmendments(),
    getPendingAlternatives(),
    getPendingAlternativeSuggestions(),
  ]);
  return { pending, amendments, altsPending, altSuggestions };
};

export const actions: Actions = {
  approveCompany: async ({ request, locals }) => {
    if (locals.role !== "moderator" && locals.role !== "admin") throw error(403);
    const id = (await request.formData()).get("id")?.toString();
    if (id) await updateCompanyStatus(id, "approved");
  },
  rejectCompany: async ({ request, locals }) => {
    if (locals.role !== "moderator" && locals.role !== "admin") throw error(403);
    const id = (await request.formData()).get("id")?.toString();
    if (id) await updateCompanyStatus(id, "rejected");
  },
  deleteCompany: async ({ request, locals }) => {
    if (locals.role !== "moderator" && locals.role !== "admin") throw error(403);
    const id = (await request.formData()).get("id")?.toString();
    if (id) await db.delete(companies).where(eq(companies.id, id));
  },
  approveAmendment: async ({ request, locals }) => {
    if (locals.role !== "moderator" && locals.role !== "admin") throw error(403);
    const id = (await request.formData()).get("id")?.toString();
    if (id) await updateAmendmentStatus(id, "approved");
  },
  rejectAmendment: async ({ request, locals }) => {
    if (locals.role !== "moderator" && locals.role !== "admin") throw error(403);
    const id = (await request.formData()).get("id")?.toString();
    if (id) await updateAmendmentStatus(id, "rejected");
  },
  approveAlternative: async ({ request, locals }) => {
    if (locals.role !== "moderator" && locals.role !== "admin") throw error(403);
    const id = (await request.formData()).get("id")?.toString();
    if (id) await updateAlternativeStatus(id, "approved");
  },
  rejectAlternative: async ({ request, locals }) => {
    if (locals.role !== "moderator" && locals.role !== "admin") throw error(403);
    const id = (await request.formData()).get("id")?.toString();
    if (id) await updateAlternativeStatus(id, "rejected");
  },
  deleteAlternativeAdmin: async ({ request, locals }) => {
    if (locals.role !== "moderator" && locals.role !== "admin") throw error(403);
    const id = (await request.formData()).get("id")?.toString();
    if (id) await deleteAlternative(id);
  },
  approveAltSuggestion: async ({ request, locals }) => {
    if (locals.role !== "moderator" && locals.role !== "admin") throw error(403);
    const id = (await request.formData()).get("id")?.toString();
    if (id) await updateAlternativeSuggestionStatus(id, "approved");
  },
  rejectAltSuggestion: async ({ request, locals }) => {
    if (locals.role !== "moderator" && locals.role !== "admin") throw error(403);
    const id = (await request.formData()).get("id")?.toString();
    if (id) await updateAlternativeSuggestionStatus(id, "rejected");
  },
};
