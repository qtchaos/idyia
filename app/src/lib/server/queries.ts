import { db } from "./db/index";
import { companies, userRole, amendments, user } from "./db/schema";
import { eq, and, like, or, asc, desc } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import type { Role, CompanySizeCode } from "./db/schema";

export const COMPANY_SIZE_LABELS: Record<CompanySizeCode, string> = {
  A: "Self-employed",
  B: "1–10",
  C: "11–50",
  D: "51–200",
  E: "201–500",
  F: "501–1,000",
  G: "1,001–5,000",
  H: "5,001–10,000",
  I: "10,001+",
};

export const COMPANY_TYPES = [
  "restaurant",
  "saas",
  "government",
  "institution",
  "retail",
  "finance",
  "healthcare",
  "media",
  "education",
  "other",
] as const;

export type SortField = "name" | "company_type" | "company_size" | "created_at";
export type SortDir = "asc" | "desc";

export interface CompanyQuery {
  limit?: number;
  sort?: SortField;
  dir?: SortDir;
  q?: string;
  type?: string;
  size?: string;
  userId?: string;
  userRole?: Role;
}

export async function queryCompanies(opts: CompanyQuery) {
  const limit = Math.min(opts.limit ?? 50, 100);
  const sort = opts.sort ?? "created_at";
  const dir = opts.dir ?? "desc";
  const role = opts.userRole;

  let statusFilter: SQL | undefined;
  if (role === "moderator" || role === "admin") {
    statusFilter = undefined;
  } else if (role === "trusted_contributor" || role === "contributor") {
    statusFilter = or(
      eq(companies.status, "approved"),
      eq(companies.submittedBy, opts.userId ?? "___none___"),
    );
  } else {
    statusFilter = eq(companies.status, "approved");
  }

  const searchFilter = opts.q
    ? or(
        like(companies.name, `%${opts.q}%`),
        like(companies.description, `%${opts.q}%`),
        like(companies.companyType, `%${opts.q}%`),
      )
    : undefined;

  const typeFilter = opts.type ? eq(companies.companyType, opts.type) : undefined;
  const sizeFilter = opts.size ? eq(companies.companySize, opts.size) : undefined;

  const filters = [statusFilter, searchFilter, typeFilter, sizeFilter].filter(
    (f): f is SQL => f !== undefined,
  );
  const where =
    filters.length === 0 ? undefined : filters.length === 1 ? filters[0] : and(...filters);

  const colMap = {
    name: companies.name,
    company_type: companies.companyType,
    company_size: companies.companySize,
    created_at: companies.createdAt,
  };
  const orderCol = colMap[sort];
  const orderFn = dir === "asc" ? asc : desc;

  const rows = await db
    .select()
    .from(companies)
    .where(where)
    .orderBy(orderFn(orderCol))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  return { rows: rows.slice(0, limit), hasMore };
}

export async function getUserRole(userId: string): Promise<Role> {
  const row = await db.select().from(userRole).where(eq(userRole.userId, userId)).get();
  return row?.role ?? "contributor";
}

export async function setUserRole(userId: string, role: Role) {
  await db
    .insert(userRole)
    .values({ userId, role })
    .onConflictDoUpdate({ target: userRole.userId, set: { role } });
}

export async function getPendingCompanies() {
  return db.select().from(companies).where(eq(companies.status, "pending")).all();
}

export async function updateCompanyStatus(id: string, status: "approved" | "rejected") {
  await db.update(companies).set({ status, updatedAt: new Date() }).where(eq(companies.id, id));
}

export async function searchCompaniesByName(q: string) {
  if (!q || q.length < 2) return [];
  return db
    .select({
      id: companies.id,
      name: companies.name,
      website: companies.website,
      description: companies.description,
      imageOrigin: companies.imageOrigin,
    })
    .from(companies)
    .where(and(eq(companies.status, 'approved'), like(companies.name, `%${q}%`)))
    .limit(6)
    .all();
}

export async function getPendingAmendments() {
  return db
    .select({
      amendment: amendments,
      companyName: companies.name,
      companyWebsite: companies.website,
      submitterName: user.name,
    })
    .from(amendments)
    .innerJoin(companies, eq(amendments.companyId, companies.id))
    .leftJoin(user, eq(amendments.submittedBy, user.id))
    .where(eq(amendments.status, 'pending'))
    .all();
}

export async function updateAmendmentStatus(id: string, status: 'approved' | 'rejected') {
  if (status === 'approved') {
    const row = await db.select().from(amendments).where(eq(amendments.id, id)).get();
    if (row) {
      const patch: Record<string, unknown> = { updatedAt: new Date() };
      if (row.descriptionAfter !== null) patch.description = row.descriptionAfter;
      if (row.imageOriginAfter !== null) patch.imageOrigin = row.imageOriginAfter;
      await db.update(companies).set(patch).where(eq(companies.id, row.companyId));
    }
  }
  await db
    .update(amendments)
    .set({ status, updatedAt: new Date() })
    .where(eq(amendments.id, id));
}
