import { db } from "./db/index";
import { companies, userRole, amendments, alternatives, alternativeSuggestions, user, karmaTransactions, userKarma } from "./db/schema";
import { eq, and, like, or, asc, desc, sql, gt, getTableColumns, ilike } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import type { Role, CompanySizeCode, KarmaReason } from "./db/schema";

// Escapes LIKE wildcards in user input so a literal `%` or `_` in a search
// term doesn't act as a SQL wildcard. Paired with `ESCAPE '\'` at each call site.
function likeTerm(raw: string): string {
  return `%${raw.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
}

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
  "food",
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
  offset?: number;
  sort?: SortField;
  dir?: SortDir;
  q?: string;
  type?: string;
  size?: string;
  country?: string;
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
    ? (() => {
        const term = likeTerm(opts.q!);
        return or(
          sql`${companies.name} LIKE ${term} ESCAPE '\'`,
          sql`${companies.description} LIKE ${term} ESCAPE '\'`,
          sql`${companies.companyType} LIKE ${term} ESCAPE '\'`,
        );
      })()
    : undefined;

  const typeFilter = opts.type ? eq(companies.companyType, opts.type) : undefined;
  const sizeFilter = opts.size ? eq(companies.companySize, opts.size) : undefined;
  const countryFilter = opts.country ? eq(companies.country, opts.country) : undefined;

  const filters = [statusFilter, searchFilter, typeFilter, sizeFilter, countryFilter].filter(
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
    .offset(opts.offset ?? 0)
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
  return db
    .select({
      ...getTableColumns(companies),
      submitterName: user.name,
      submitterKarma: userKarma.total,
    })
    .from(companies)
    .leftJoin(user, eq(companies.submittedBy, user.id))
    .leftJoin(userKarma, eq(companies.submittedBy, userKarma.userId))
    .where(eq(companies.status, "pending"))
    .all();
}

export async function awardKarma(
  userId: string,
  amount: number,
  reason: KarmaReason,
  referenceId?: string,
  note?: string,
) {
  await db.insert(karmaTransactions).values({ userId, amount, reason, referenceId, note });
  await db
    .insert(userKarma)
    .values({ userId, total: amount })
    .onConflictDoUpdate({
      target: userKarma.userId,
      set: { total: sql`${userKarma.total} + ${amount}` },
    });
}

export async function getUserKarma(userId: string): Promise<number> {
  const row = await db.select().from(userKarma).where(eq(userKarma.userId, userId)).get();
  return row?.total ?? 0;
}

export async function updateCompanyStatus(id: string, status: "approved" | "rejected") {
  const company = await db
    .select({ submittedBy: companies.submittedBy })
    .from(companies)
    .where(eq(companies.id, id))
    .get();
  await db.update(companies).set({ status, updatedAt: new Date() }).where(eq(companies.id, id));
  if (company?.submittedBy) {
    await awardKarma(
      company.submittedBy,
      status === "approved" ? 5 : -10,
      status === "approved" ? "company_approved" : "company_rejected",
      id,
    );
  }
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
    .where(and(eq(companies.status, "approved"), sql`${companies.name} LIKE ${likeTerm(q)} ESCAPE '\'`))
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
      submitterKarma: userKarma.total,
    })
    .from(amendments)
    .innerJoin(companies, eq(amendments.companyId, companies.id))
    .leftJoin(user, eq(amendments.submittedBy, user.id))
    .leftJoin(userKarma, eq(amendments.submittedBy, userKarma.userId))
    .where(eq(amendments.status, "pending"))
    .all();
}

export async function getCompanyById(id: string) {
  return db
    .select()
    .from(companies)
    .where(and(eq(companies.id, id), eq(companies.status, "approved")))
    .get();
}

export async function getAllApprovedCompanies() {
  return db
    .select({ id: companies.id, name: companies.name, updatedAt: companies.updatedAt })
    .from(companies)
    .where(eq(companies.status, "approved"))
    .all();
}

export async function getAlternativesForCompany(
  companyId: string,
  opts: { userId?: string; role?: Role } = {},
) {
  const { userId, role } = opts;
  let statusFilter: SQL | undefined;
  if (role === "moderator" || role === "admin") {
    statusFilter = undefined;
  } else if (userId) {
    statusFilter = or(
      eq(alternatives.status, "approved"),
      eq(alternatives.submittedBy, userId),
    );
  } else {
    statusFilter = eq(alternatives.status, "approved");
  }
  const where = and(eq(alternatives.companyId, companyId), statusFilter);
  return db.select().from(alternatives).where(where).orderBy(asc(alternatives.createdAt)).all();
}

export async function addAlternative(
  companyId: string,
  url: string,
  name: string | null,
  submittedBy: string,
  isTrusted: boolean,
): Promise<{ duplicate: boolean }> {
  // Normalise for dedup: use origin only (no path, query, or hash)
  let normUrl = url;
  try { normUrl = new URL(url).origin; } catch { /* keep raw */ }

  const existing = await db
    .select({ id: alternatives.id })
    .from(alternatives)
    .where(and(eq(alternatives.companyId, companyId), eq(alternatives.url, normUrl)))
    .get();
  if (existing) return { duplicate: true };

  await db.insert(alternatives).values({
    companyId,
    url: normUrl,
    name,
    submittedBy,
    status: isTrusted ? "approved" : "pending",
  });
  return { duplicate: false };
}

export async function deleteAlternative(id: string) {
  await db.delete(alternatives).where(eq(alternatives.id, id));
}

export async function updateAlternative(id: string, url: string, name: string | null) {
  await db.update(alternatives).set({ url, name }).where(eq(alternatives.id, id));
}

export async function getPendingAlternatives() {
  return db
    .select({
      alt: alternatives,
      companyName: companies.name,
      companyId: companies.id,
      submitterName: user.name,
      submitterKarma: userKarma.total,
    })
    .from(alternatives)
    .innerJoin(companies, eq(alternatives.companyId, companies.id))
    .leftJoin(user, eq(alternatives.submittedBy, user.id))
    .leftJoin(userKarma, eq(alternatives.submittedBy, userKarma.userId))
    .where(eq(alternatives.status, "pending"))
    .all();
}

export async function updateAlternativeStatus(id: string, status: "approved" | "rejected") {
  const alt = await db
    .select({ submittedBy: alternatives.submittedBy })
    .from(alternatives)
    .where(eq(alternatives.id, id))
    .get();
  await db.update(alternatives).set({ status }).where(eq(alternatives.id, id));
  if (alt?.submittedBy) {
    await awardKarma(
      alt.submittedBy,
      status === "approved" ? 3 : -6,
      status === "approved" ? "alternative_approved" : "alternative_rejected",
      id,
    );
  }
}

export async function getLeaderboard() {
  return db
    .select({
      userId: userKarma.userId,
      name: user.name,
      karma: userKarma.total,
      approvedSubmissions: sql<number>`count(${companies.id})`,
    })
    .from(userKarma)
    .innerJoin(user, eq(userKarma.userId, user.id))
    .leftJoin(
      companies,
      and(eq(companies.submittedBy, userKarma.userId), eq(companies.status, "approved")),
    )
    .where(gt(userKarma.total, 0))
    .groupBy(userKarma.userId)
    .orderBy(desc(userKarma.total))
    .limit(10)
    .all();
}

export async function updateAmendmentStatus(id: string, status: "approved" | "rejected") {
  if (status === "approved") {
    const row = await db.select().from(amendments).where(eq(amendments.id, id)).get();
    if (row) {
      const patch: Record<string, unknown> = { updatedAt: new Date() };
      if (row.descriptionAfter !== null) patch.description = row.descriptionAfter;
      if (row.imageOriginAfter !== null) patch.imageOrigin = row.imageOriginAfter;
      await db.update(companies).set(patch).where(eq(companies.id, row.companyId));
    }
  }
  await db.update(amendments).set({ status, updatedAt: new Date() }).where(eq(amendments.id, id));
}

// ─── Admin user management ────────────────────────────────────────────────────

export async function searchUsers(q: string) {
  const term = `%${q}%`;
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: userRole.role,
      karma: userKarma.total,
    })
    .from(user)
    .leftJoin(userRole, eq(user.id, userRole.userId))
    .leftJoin(userKarma, eq(user.id, userKarma.userId))
    .where(or(like(user.name, term), like(user.email, term)))
    .orderBy(asc(user.name))
    .all();
}

export async function getAllUsers() {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: userRole.role,
      karma: userKarma.total,
    })
    .from(user)
    .leftJoin(userRole, eq(user.id, userRole.userId))
    .leftJoin(userKarma, eq(user.id, userKarma.userId))
    .orderBy(asc(user.name))
    .all();
}

export async function getAdminUserProfile(userId: string) {
  const profile = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      role: userRole.role,
      karma: userKarma.total,
    })
    .from(user)
    .leftJoin(userRole, eq(user.id, userRole.userId))
    .leftJoin(userKarma, eq(user.id, userKarma.userId))
    .where(eq(user.id, userId))
    .get();

  if (!profile) return null;

  const transactions = await db
    .select()
    .from(karmaTransactions)
    .where(eq(karmaTransactions.userId, userId))
    .orderBy(desc(karmaTransactions.createdAt))
    .all();

  const submissions = await db
    .select({
      id: companies.id,
      name: companies.name,
      status: companies.status,
      companyType: companies.companyType,
      createdAt: companies.createdAt,
    })
    .from(companies)
    .where(eq(companies.submittedBy, userId))
    .orderBy(desc(companies.createdAt))
    .all();

  const alts = await db
    .select({
      id: alternatives.id,
      url: alternatives.url,
      altName: alternatives.name,
      status: alternatives.status,
      createdAt: alternatives.createdAt,
      companyId: alternatives.companyId,
      companyName: companies.name,
    })
    .from(alternatives)
    .leftJoin(companies, eq(alternatives.companyId, companies.id))
    .where(eq(alternatives.submittedBy, userId))
    .orderBy(desc(alternatives.createdAt))
    .all();

  return { ...profile, transactions, submissions, alts };
}

export async function updateUserProfile(
  userId: string,
  patch: { name?: string; email?: string },
) {
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.email !== undefined) update.email = patch.email;
  await db.update(user).set(update).where(eq(user.id, userId));
}

export async function addManualKarma(userId: string, amount: number, note: string) {
  await awardKarma(userId, amount, "admin_adjustment", undefined, note || undefined);
}

export async function submitAlternativeSuggestion(opts: {
  alternativeId: string;
  submittedBy: string;
  type: "edit" | "remove";
  note: string;
  urlAfter?: string;
  nameAfter?: string | null;
}) {
  await db.insert(alternativeSuggestions).values({
    alternativeId: opts.alternativeId,
    submittedBy: opts.submittedBy,
    type: opts.type,
    note: opts.note,
    urlAfter: opts.urlAfter ?? null,
    nameAfter: opts.nameAfter !== undefined ? opts.nameAfter : null,
  });
}

export async function getPendingAlternativeSuggestions() {
  return db
    .select({
      suggestion: alternativeSuggestions,
      altUrl: alternatives.url,
      altName: alternatives.name,
      altId: alternatives.id,
      companyId: alternatives.companyId,
      companyName: companies.name,
      submitterName: user.name,
      submitterKarma: userKarma.total,
    })
    .from(alternativeSuggestions)
    .innerJoin(alternatives, eq(alternativeSuggestions.alternativeId, alternatives.id))
    .innerJoin(companies, eq(alternatives.companyId, companies.id))
    .leftJoin(user, eq(alternativeSuggestions.submittedBy, user.id))
    .leftJoin(userKarma, eq(alternativeSuggestions.submittedBy, userKarma.userId))
    .where(eq(alternativeSuggestions.status, "pending"))
    .all();
}

export async function updateAlternativeSuggestionStatus(id: string, status: "approved" | "rejected") {
  const suggestion = await db
    .select()
    .from(alternativeSuggestions)
    .where(eq(alternativeSuggestions.id, id))
    .get();

  if (!suggestion) return;

  await db
    .update(alternativeSuggestions)
    .set({ status })
    .where(eq(alternativeSuggestions.id, id));

  if (status === "approved") {
    if (suggestion.type === "edit" && suggestion.urlAfter) {
      await updateAlternative(suggestion.alternativeId, suggestion.urlAfter, suggestion.nameAfter ?? null);
    } else if (suggestion.type === "remove") {
      await deleteAlternative(suggestion.alternativeId);
    }
  } else if (status === "rejected" && suggestion.type === "edit" && suggestion.submittedBy) {
    await awardKarma(suggestion.submittedBy, -6, "alt_suggestion_rejected", id);
  }
}

export async function deleteKarmaTransaction(txId: string) {
  const tx = await db
    .select()
    .from(karmaTransactions)
    .where(eq(karmaTransactions.id, txId))
    .get();
  if (!tx) return;
  await db.delete(karmaTransactions).where(eq(karmaTransactions.id, txId));
  await db
    .update(userKarma)
    .set({ total: sql`${userKarma.total} - ${tx.amount}` })
    .where(eq(userKarma.userId, tx.userId));
}
