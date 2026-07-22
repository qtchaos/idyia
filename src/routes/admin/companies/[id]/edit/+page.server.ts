import { error, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db/index";
import { companies } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import {
  validate,
  fromFormData,
  CompanyCreateSchema,
} from "$lib/server/validation";
import { Type } from "@sinclair/typebox";
import type { PageServerLoad, Actions } from "./$types";

const AdminEditSchema = Type.Object({
  ...CompanyCreateSchema.properties,
  status: Type.Union([Type.Literal("pending"), Type.Literal("approved"), Type.Literal("rejected")]),
  registeredName: Type.Optional(Type.String({ maxLength: 255 })),
  registryUrl: Type.Optional(Type.String({ maxLength: 500 })),
  country: Type.Optional(Type.String({ maxLength: 100 })),
  imageOrigin: Type.Optional(Type.String({ maxLength: 500 })),
});

export const load: PageServerLoad = async ({ params, locals }) => {
  if (locals.role !== "moderator" && locals.role !== "admin") throw error(403, "Forbidden");

  const company = await db.select().from(companies).where(eq(companies.id, params.id)).get();
  if (!company) throw error(404, "Not found");

  return { company };
};

export const actions: Actions = {
  update: async ({ params, request, locals }) => {
    if (locals.role !== "moderator" && locals.role !== "admin") throw error(403, "Forbidden");

    const fields = validate(AdminEditSchema, fromFormData(await request.formData()));

    await db
      .update(companies)
      .set({
        name: fields.name,
        registeredName: fields.registeredName ?? null,
        registryUrl: fields.registryUrl ?? null,
        website: fields.website,
        companyType: fields.companyType,
        description: fields.description,
        companySize: fields.companySize,
        country: fields.country ?? null,
        imageOrigin: fields.imageOrigin ?? null,
        status: fields.status,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, params.id));

    redirect(302, "/admin/pending");
  },

  delete: async ({ params, locals }) => {
    if (locals.role !== "moderator" && locals.role !== "admin") throw error(403, "Forbidden");
    await db.delete(companies).where(eq(companies.id, params.id));
    redirect(302, "/admin/pending");
  },
};
