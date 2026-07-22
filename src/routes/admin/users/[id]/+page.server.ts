import { error, fail } from "@sveltejs/kit";
import {
  getAdminUserProfile,
  updateUserProfile,
  addManualKarma,
  deleteKarmaTransaction,
  setUserRole,
} from "$lib/server/queries";
import type { PageServerLoad, Actions } from "./$types";
import type { Role } from "$lib/server/db/schema";

export const load: PageServerLoad = async ({ params, locals }) => {
  const profile = await getAdminUserProfile(params.id);
  if (!profile) throw error(404, "User not found");
  return { profile };
};

export const actions: Actions = {
  editProfile: async ({ params, request, locals }) => {
    if (locals.role !== "admin") throw error(403, "Forbidden");

    const fd = await request.formData();
    const name = fd.get("name")?.toString().trim();
    const email = fd.get("email")?.toString().trim();

    if (!name || name.length === 0) return fail(400, { error: "Name cannot be empty." });
    if (!email || email.length === 0) return fail(400, { error: "Email cannot be empty." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return fail(400, { error: "Invalid email address." });

    try {
      await updateUserProfile(params.id, { name, email });
    } catch {
      return fail(400, { error: "Email is already in use by another account." });
    }

    return { success: "Profile updated." };
  },

  setRole: async ({ params, request, locals }) => {
    if (locals.role !== "admin") throw error(403, "Forbidden");
    const fd = await request.formData();
    const role = fd.get("role")?.toString() as Role;
    const valid: Role[] = ["contributor", "trusted_contributor", "moderator", "admin"];
    if (!valid.includes(role)) return fail(400, { error: "Invalid role." });
    await setUserRole(params.id, role);
    return { success: "Role updated." };
  },

  addKarma: async ({ params, request, locals }) => {
    if (locals.role !== "admin") throw error(403, "Forbidden");

    const fd = await request.formData();
    const rawAmount = fd.get("amount")?.toString().trim();
    const note = fd.get("note")?.toString().trim() ?? "";

    const amount = parseInt(rawAmount ?? "", 10);
    if (isNaN(amount) || amount === 0)
      return fail(400, { error: "Amount must be a non-zero integer." });
    if (Math.abs(amount) > 10000) return fail(400, { error: "Amount too large (max ±10,000)." });

    await addManualKarma(params.id, amount, note);
    return { success: `Karma ${amount > 0 ? "+" : ""}${amount} applied.` };
  },

  deleteTx: async ({ request, locals }) => {
    if (locals.role !== "admin") throw error(403, "Forbidden");
    const fd = await request.formData();
    const txId = fd.get("txId")?.toString();
    if (!txId) return fail(400, { error: "Missing transaction ID." });
    await deleteKarmaTransaction(txId);
    return { success: "Transaction deleted." };
  },
};
