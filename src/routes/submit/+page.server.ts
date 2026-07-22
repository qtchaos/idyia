import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db/index";
import { companies, amendments } from "$lib/server/db/schema";
import { eq, and, like } from "drizzle-orm";
import {
  validateForm,
  fromFormData,
  CompanyCreateSchema,
  CompanyAmendSchema,
} from "$lib/server/validation";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) redirect(302, "/auth/login");

  const companyId = url.searchParams.get("company");
  if (companyId) {
    const preselected = await db
      .select({
        id: companies.id,
        name: companies.name,
        website: companies.website,
        description: companies.description,
        imageOrigin: companies.imageOrigin,
      })
      .from(companies)
      .where(eq(companies.id, companyId))
      .get();
    if (preselected) return { preselected };
  }

  return {};
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "Unauthenticated" });

    const result = validateForm(CompanyCreateSchema, fromFormData(await request.formData()));
    if (!result.ok) return fail(400, { error: result.error });
    const fields = result.value;

    // Prevent the same user spamming the same company name while pending
    const dup = await db
      .select({ id: companies.id })
      .from(companies)
      .where(
        and(
          like(companies.name, fields.name),
          eq(companies.submittedBy, locals.user.id),
          eq(companies.status, "pending"),
        ),
      )
      .get();
    if (dup)
      return fail(409, {
        error: "You already have a pending submission for a company with this name.",
      });

    const isTrusted = locals.role === "trusted_contributor" || locals.role === "admin";

    await db.insert(companies).values({
      name: fields.name,
      website: fields.website,
      companyType: fields.companyType,
      description: fields.description,
      companySize: fields.companySize,
      country: fields.country ?? null,
      registeredName: fields.registeredName ?? null,
      registryUrl: fields.registryUrl ?? null,
      urlRegex: fields.urlRegex ?? null,
      imageOrigin: fields.imageOrigin ?? null,
      imageUrl: null,
      status: isTrusted ? "approved" : "pending",
      submittedBy: locals.user.id,
    });

    redirect(302, isTrusted ? "/" : "/submit?submitted=1");
  },

  amend: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "Unauthenticated" });

    const result = validateForm(CompanyAmendSchema, fromFormData(await request.formData()));
    if (!result.ok) return fail(400, { error: result.error });
    const fields = result.value;

    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.id, fields.companyId))
      .get();
    if (!company) return fail(404, { error: "Company not found" });

    const isTrusted = locals.role === "trusted_contributor" || locals.role === "admin";

    // Non-trusted users can only amend approved companies
    if (!isTrusted && company.status !== "approved") {
      return fail(400, { error: "Amendments can only be submitted for approved companies." });
    }

    if (!fields.description && !fields.imageOrigin) {
      return fail(400, { error: "Provide at least one field to amend" });
    }

    if (isTrusted) {
      const patch: Record<string, unknown> = { updatedAt: new Date() };
      if (fields.description) patch.description = fields.description;
      if (fields.imageOrigin) patch.imageOrigin = fields.imageOrigin;
      await db.update(companies).set(patch).where(eq(companies.id, fields.companyId));
      redirect(302, "/");
    }

    // Prevent duplicate pending amendments from the same user for the same company
    const dup = await db
      .select({ id: amendments.id })
      .from(amendments)
      .where(
        and(
          eq(amendments.companyId, fields.companyId),
          eq(amendments.submittedBy, locals.user.id),
          eq(amendments.status, "pending"),
        ),
      )
      .get();
    if (dup) return fail(409, { error: "You already have a pending amendment for this company." });

    await db.insert(amendments).values({
      companyId: fields.companyId,
      submittedBy: locals.user.id,
      descriptionBefore: company.description,
      imageOriginBefore: company.imageOrigin,
      descriptionAfter: fields.description ?? null,
      imageOriginAfter: fields.imageOrigin ?? null,
    });

    redirect(302, "/submit?submitted=1");
  },
};
