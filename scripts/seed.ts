/**
 * Usage:
 *   bun run scripts/seed.ts          → seeds admin + 25 random companies
 *   bun run scripts/seed.ts 100      → seeds admin + 100 random companies
 *   bun run scripts/seed.ts 50 clear → also clears existing companies first
 */

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { hashPassword } from "@better-auth/utils/password";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/server/db/schema.ts";

const client = createClient({ url: "file:local.db" });
const db = drizzle(client, { schema });

const count = Number(process.argv[2] ?? 25);
const clear = process.argv.includes("clear");

// Fixed ID so re-runs don't create orphaned accounts
const ADMIN_ID = "00000000-0000-0000-0000-000000000001";

const existingAdmin = await db
  .select({ id: schema.user.id })
  .from(schema.user)
  .where(eq(schema.user.email, "admin@idyia.local"))
  .get();

const adminId = existingAdmin?.id ?? ADMIN_ID;

if (!existingAdmin) {
  const password = await hashPassword("admin");
  await db.insert(schema.user).values({
    id: adminId,
    name: "Admin",
    email: "admin@idyia.local",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await db.insert(schema.account).values({
    id: crypto.randomUUID(),
    accountId: adminId,
    providerId: "credential",
    userId: adminId,
    password,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await db
    .insert(schema.userRole)
    .values({ userId: adminId, role: "admin" })
    .onConflictDoUpdate({ target: schema.userRole.userId, set: { role: "admin" } });
  console.log("✓  created admin@idyia.local / admin");
} else {
  console.log("✓  admin already exists");
}

if (clear) {
  await db.delete(schema.companies);
  console.log("cleared existing companies");
}

const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const prefixes = [
  "Nord",
  "Tele",
  "Omni",
  "Neo",
  "Meta",
  "Hyper",
  "Ultra",
  "Super",
  "Cyber",
  "Data",
  "Auto",
  "Eco",
  "Bio",
  "Geo",
  "Aero",
  "Nano",
  "Macro",
  "Micro",
  "Smart",
  "Fast",
];
const middles = [
  "flux",
  "ware",
  "core",
  "base",
  "link",
  "sync",
  "flow",
  "grid",
  "hub",
  "lab",
  "net",
  "tech",
  "sys",
  "soft",
  "logic",
  "mind",
  "wise",
  "forge",
  "works",
  "space",
];
const suffixes = [
  "",
  "",
  "",
  "",
  "AI",
  "AI",
  "Labs",
  "Group",
  "Co",
  "Systems",
  "Technologies",
  "Digital",
  "Solutions",
  "Studio",
  "HQ",
];

const tlds = ["com", "io", "ai", "ee", "eu", "co", "tech", "app"];

const types: schema.CompanySizeCode[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

const companyTypes = [
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

const registrySuffixes: Record<string, string[]> = {
  ee: ["OÜ", "AS", "MTÜ"],
  eu: ["GmbH", "BV", "SAS", "Ltd"],
  com: ["Inc", "LLC", "Corp", "Ltd"],
  io: ["Ltd", "Inc"],
  ai: ["Ltd", "Inc"],
  co: ["Ltd", "Corp"],
  tech: ["Inc", "LLC"],
  app: ["Ltd", "Inc"],
};

const descriptionTemplates: Record<string, string[]> = {
  restaurant: [
    "AI-generated seasonal menu designs and promotional imagery deployed across all locations.",
    "Uses GPT-4o to write weekly specials copy and social media captions.",
    "Generative AI produces staff training materials and food safety documentation.",
    "AI-generated dish photography for the online ordering platform.",
    "Customer review summaries auto-generated for management dashboards.",
  ],
  saas: [
    "Integrated GPT-4 to generate onboarding email sequences personalised per user segment.",
    "AI-written release notes and changelog entries shipped to 200k+ users monthly.",
    "In-app AI assistant handles support queries, reducing ticket volume by 35%.",
    "Generative AI synthesises edge-case training data for fraud detection models.",
    "Uses LLMs to auto-generate API documentation from code comments.",
    "AI-powered churn prediction reports auto-summarised for account managers.",
  ],
  government: [
    "Piloting an LLM-based Q&A assistant for citizens navigating e-government services.",
    "AI-generated plain-language summaries of legislation published on the official portal.",
    "Automated translation of public documents into minority languages via generative AI.",
    "Uses AI to draft initial versions of policy impact assessments.",
    "AI-assisted transcription and summarisation of parliamentary proceedings.",
  ],
  institution: [
    "Auto-generated course outlines and assessment rubrics using GPT-4.",
    "Research paper abstracts summarised by LLM for internal knowledge base.",
    "AI-generated grant application templates for research teams.",
    "Uses generative AI to produce multilingual informational brochures.",
  ],
  retail: [
    "Product description copy for 50,000+ SKUs generated via GPT-4o fine-tune.",
    "AI-generated personalised promotional emails sent to loyalty programme members.",
    "Seasonal campaign visuals produced using Midjourney and DALL-E.",
    "AI writes and A/B tests landing page headlines automatically.",
    "Inventory shortage notifications auto-drafted and sent to suppliers.",
  ],
  finance: [
    "Loan offer summaries and fee breakdowns auto-generated for 2M+ customers.",
    "AI-drafted quarterly investment commentary reviewed and published by analysts.",
    "Compliance document first drafts generated by an internal LLM deployment.",
    "Uses generative AI to create personalised financial health reports.",
    "AI-generated fraud alert messages localised for 12 markets.",
  ],
  healthcare: [
    "AI-generated patient discharge summaries reviewed by clinicians before distribution.",
    "Multilingual health information leaflets produced via generative AI.",
    "Clinical trial recruitment emails personalised by LLM for patient cohorts.",
    "AI drafts referral letters based on structured consultation notes.",
  ],
  media: [
    "AI-generated article headlines tested at scale against human-written alternatives.",
    "Automated sports match summaries published within seconds of final whistle.",
    "Uses LLMs to generate SEO meta descriptions for 100k+ archive pages.",
    "AI produces personalised newsletter digests for 500k subscribers.",
    "Podcast episode descriptions auto-generated from transcripts.",
  ],
  education: [
    "AI-generated personalised feedback on student essays at scale.",
    "Automated quiz generation from lecture transcripts using GPT-4.",
    "Course summaries and study guides produced by an internal LLM.",
    "AI writing assistant integrated into the student portal.",
    "Generates accessible versions of course materials for students with disabilities.",
  ],
  other: [
    "Internal documentation and runbooks auto-generated from Jira tickets.",
    "AI-written job descriptions deployed across all open roles.",
    "Uses generative AI for synthetic data generation in testing pipelines.",
    "AI-generated investor update emails reviewed monthly by founders.",
  ],
};

const sourceDomains = [
  "twitter.com",
  "x.com",
  "linkedin.com",
  "techcrunch.com",
  "wired.com",
  "venturebeat.com",
  "web.archive.org",
  "reuters.com",
  "bloomberg.com",
  "theverge.com",
  "medium.com",
  "substack.com",
  "blog.",
  "news.",
  "press.",
];

function makeName(): string {
  const prefix = rand(prefixes);
  const middle = rand(middles);
  const suffix = rand(suffixes);
  return suffix ? `${prefix}${middle} ${suffix}` : `${prefix}${middle}`;
}

function makeWebsite(name: string): { website: string; tld: string } {
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
  const tld = rand(tlds);
  return { website: `https://${slug}.${tld}`, tld };
}

function makeRegistered(
  name: string,
  tld: string,
): { registeredName: string | null; registryUrl: string | null } {
  if (Math.random() < 0.4) return { registeredName: null, registryUrl: null };
  const legalSuffixes = registrySuffixes[tld] ?? ["Ltd"];
  const legalSuffix = rand(legalSuffixes);
  const baseName = name.replace(
    / (Labs|Group|Co|Systems|Technologies|Digital|Solutions|Studio|HQ|AI)$/,
    "",
  );
  return {
    registeredName: `${baseName} ${legalSuffix}`,
    registryUrl:
      Math.random() < 0.6 ? `https://registry.example.com/${baseName.toLowerCase()}` : null,
  };
}

function makeSource(): string | null {
  if (Math.random() < 0.25) return null;
  const domain = rand(sourceDomains);
  const slug = Math.random().toString(36).slice(2, 10);
  return `https://${domain}${domain.endsWith(".") ? "company" : ""}/${slug}`;
}

const generated = new Set<string>();
const companies: schema.NewCompany[] = [];

for (let i = 0; i < count; i++) {
  let name: string;
  do {
    name = makeName();
  } while (generated.has(name));
  generated.add(name);

  const type = rand([...companyTypes]);
  const { website, tld } = makeWebsite(name);
  const { registeredName, registryUrl } = makeRegistered(name, tld);
  const size = rand(types);
  const description = rand(descriptionTemplates[type] ?? descriptionTemplates.other);

  companies.push({
    name,
    registeredName,
    registryUrl,
    website,
    companyType: type,
    companySize: size,
    description,
    imageOrigin: makeSource(),
    imageUrl: null,
    urlRegex: null,
    status: Math.random() < 0.85 ? "approved" : "pending",
    submittedBy: adminId,
  });
}

// Batch insert
const batchSize = 50;
for (let i = 0; i < companies.length; i += batchSize) {
  await db
    .insert(schema.companies)
    .values(companies.slice(i, i + batchSize))
    .onConflictDoNothing();
}

console.log(
  `✓  inserted ${companies.length} companies (${companies.filter((c) => c.status === "approved").length} approved, ${companies.filter((c) => c.status === "pending").length} pending)`,
);
process.exit(0);
