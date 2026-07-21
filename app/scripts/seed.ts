import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { hashPassword } from '@better-auth/utils/password';
import * as schema from '../src/lib/server/db/schema.ts';

const client = createClient({ url: 'file:local.db' });
const db = drizzle(client, { schema });

const adminId = crypto.randomUUID();
const sessionId = crypto.randomUUID();
const accountId = crypto.randomUUID();

const password = await hashPassword('admin');

// Upsert admin user
await db.insert(schema.user).values({
	id: adminId,
	name: 'Admin',
	email: 'admin@idyia.local',
	emailVerified: true,
	createdAt: new Date(),
	updatedAt: new Date(),
}).onConflictDoNothing();

// Credential account
await db.insert(schema.account).values({
	id: accountId,
	accountId: adminId,
	providerId: 'credential',
	userId: adminId,
	password,
	createdAt: new Date(),
	updatedAt: new Date(),
}).onConflictDoNothing();

// Admin role
await db.insert(schema.userRole).values({
	userId: adminId,
	role: 'admin',
}).onConflictDoUpdate({ target: schema.userRole.userId, set: { role: 'admin' } });

// Seed companies
const companies = [
	{
		name: 'Bolt',
		registeredName: 'Bolt Technology OÜ',
		registryUrl: 'https://ariregister.rik.ee/ettevotja/OÜ_Bolt_Technology',
		website: 'https://bolt.eu',
		companyType: 'saas',
		description: 'Uses generative AI for automated driver/rider support chat, reducing human agent load by ~40%.',
		companySize: 'G',
		imageUrl: null,
		imageOrigin: 'https://blog.bolt.eu/en/bolt-ai/',
	},
	{
		name: 'McDonald\'s Estonia',
		registeredName: 'McDonald\'s Eesti OÜ',
		registryUrl: null,
		website: 'https://mcdonalds.ee',
		companyType: 'restaurant',
		description: 'AI-generated seasonal promotional posters and social media content used across Estonian locations.',
		companySize: 'D',
		imageUrl: null,
		imageOrigin: 'https://twitter.com/McDonaldsEE',
	},
	{
		name: 'Riigi Infosüsteemi Amet',
		registeredName: 'Riigi Infosüsteemi Amet',
		registryUrl: 'https://www.ria.ee',
		website: 'https://www.ria.ee',
		companyType: 'government',
		description: 'Piloting an LLM-based Q&A assistant for citizens navigating e-government services.',
		companySize: 'C',
		imageUrl: null,
		imageOrigin: 'https://www.ria.ee/et/uudised.html',
	},
	{
		name: 'Pipedrive',
		registeredName: 'Pipedrive OÜ',
		registryUrl: 'https://ariregister.rik.ee',
		website: 'https://pipedrive.com',
		companyType: 'saas',
		description: 'AI-generated email drafts and deal summaries inside the CRM. Powered by OpenAI GPT-4.',
		companySize: 'F',
		imageUrl: null,
		imageOrigin: 'https://pipedrive.com/blog/ai-features',
	},
	{
		name: 'Kaubamaja',
		registeredName: 'AS Kaubamaja',
		registryUrl: null,
		website: 'https://kaubamaja.ee',
		companyType: 'retail',
		description: 'Product description copy for online store generated using GPT-4o; internal QA chatbot deployed.',
		companySize: 'E',
		imageUrl: null,
		imageOrigin: 'https://kaubamaja.ee/uudised',
	},
	{
		name: 'Veriff',
		registeredName: 'Veriff OÜ',
		registryUrl: 'https://ariregister.rik.ee',
		website: 'https://veriff.com',
		companyType: 'saas',
		description: 'Generative AI used to synthesise edge-case training data for identity fraud detection models.',
		companySize: 'E',
		imageUrl: null,
		imageOrigin: 'https://veriff.com/blog',
	},
	{
		name: 'Tallinna Tehnikaülikool',
		registeredName: 'Tallinna Tehnikaülikool',
		registryUrl: 'https://www.ttu.ee',
		website: 'https://taltech.ee',
		companyType: 'education',
		description: 'Auto-generated course summaries and exam feedback for students via an internal LLM deployment.',
		companySize: 'D',
		imageUrl: null,
		imageOrigin: 'https://taltech.ee/uudised',
	},
	{
		name: 'LHV Pank',
		registeredName: 'AS LHV Pank',
		registryUrl: 'https://ariregister.rik.ee',
		website: 'https://lhv.ee',
		companyType: 'finance',
		description: 'Customer-facing loan offer summaries and internal compliance document drafting use GPT-4.',
		companySize: 'E',
		imageUrl: null,
		imageOrigin: 'https://lhv.ee/et/uudised',
	},
	{
		name: 'Transferwise / Wise',
		registeredName: 'Wise Payments Ltd',
		registryUrl: null,
		website: 'https://wise.com',
		companyType: 'finance',
		description: 'In-app AI assistant handles FX explanations and fee breakdowns for 16M+ customers.',
		companySize: 'H',
		imageUrl: null,
		imageOrigin: 'https://wise.com/blog',
	},
	{
		name: 'Skeleton Technologies',
		registeredName: 'Skeleton Technologies OÜ',
		registryUrl: null,
		website: 'https://skeletontech.com',
		companyType: 'saas',
		description: 'Engineering RFP documents auto-drafted using internal GPT-4 fine-tune trained on product specs.',
		companySize: 'C',
		imageUrl: null,
		imageOrigin: 'https://skeletontech.com/news',
	},
];

for (const c of companies) {
	await db.insert(schema.companies).values({
		...c,
		urlRegex: null,
		status: 'approved',
		submittedBy: adminId,
	}).onConflictDoNothing();
}

console.log(`✓ Admin user: admin@idyia.local / admin`);
console.log(`✓ Seeded ${companies.length} companies`);
process.exit(0);
