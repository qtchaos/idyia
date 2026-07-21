import { error, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db/index";
import { companies } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (locals.role !== "moderator" && locals.role !== "admin") throw error(403, "Forbidden");

  const company = await db.select().from(companies).where(eq(companies.id, params.id)).get();
  if (!company) throw error(404, "Not found");

  return { company };
};

export const actions: Actions = {
  default: async ({ params, request, locals }) => {
    if (locals.role !== "moderator" && locals.role !== "admin") throw error(403, "Forbidden");

    const data = await request.formData();

    await db
      .update(companies)
      .set({
        name: data.get("name")?.toString().trim() ?? "",
        registeredName: data.get("registeredName")?.toString().trim() || null,
        registryUrl: data.get("registryUrl")?.toString().trim() || null,
        website: data.get("website")?.toString().trim() ?? "",
        companyType: data.get("companyType")?.toString().trim() ?? "",
        description: data.get("description")?.toString().trim() ?? "",
        companySize: data.get("companySize")?.toString().trim() ?? "",
        country: data.get("country")?.toString().trim() || null,
        imageOrigin: data.get("imageOrigin")?.toString().trim() || null,
        status: (data.get("status")?.toString() ?? "pending") as
          | "pending"
          | "approved"
          | "rejected",
        updatedAt: new Date(),
      })
      .where(eq(companies.id, params.id));

    redirect(302, "/admin/pending");
  },
};
