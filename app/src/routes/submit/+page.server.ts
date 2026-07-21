import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/index';
import { companies, amendments } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/auth/login');
	return {};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Unauthenticated' });

		const data = await request.formData();
		const name        = data.get('name')?.toString().trim();
		const website     = data.get('website')?.toString().trim();
		const companyType = data.get('companyType')?.toString().trim();
		const description = data.get('description')?.toString().trim();
		const companySize = data.get('companySize')?.toString().trim();

		if (!name || !website || !companyType || !description || !companySize) {
			return fail(400, { error: 'Missing required fields' });
		}

		const isTrusted = locals.role === 'trusted_contributor' || locals.role === 'admin';

		await db.insert(companies).values({
			name,
			website,
			companyType,
			description,
			companySize,
			registeredName: data.get('registeredName')?.toString() || null,
			registryUrl:    data.get('registryUrl')?.toString() || null,
			urlRegex:       data.get('urlRegex')?.toString() || null,
			imageOrigin:    data.get('imageOrigin')?.toString() || null,
			imageUrl:       null,
			status:         isTrusted ? 'approved' : 'pending',
			submittedBy:    locals.user.id,
		});

		redirect(302, isTrusted ? '/' : '/submit?submitted=1');
	},

	amend: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Unauthenticated' });

		const data      = await request.formData();
		const companyId = data.get('companyId')?.toString();
		if (!companyId) return fail(400, { error: 'Missing company' });

		const company = await db.select().from(companies).where(eq(companies.id, companyId)).get();
		if (!company) return fail(404, { error: 'Company not found' });

		const newDescription = data.get('description')?.toString().trim() || null;
		const newImageOrigin = data.get('imageOrigin')?.toString().trim() || null;

		if (!newDescription && !newImageOrigin) {
			return fail(400, { error: 'Provide at least one field to amend' });
		}

		const isTrusted = locals.role === 'trusted_contributor' || locals.role === 'admin';

		if (isTrusted) {
			const patch: Record<string, unknown> = { updatedAt: new Date() };
			if (newDescription) patch.description = newDescription;
			if (newImageOrigin) patch.imageOrigin  = newImageOrigin;
			await db.update(companies).set(patch).where(eq(companies.id, companyId));
			redirect(302, '/');
		}

		await db.insert(amendments).values({
			companyId,
			submittedBy:       locals.user.id,
			descriptionBefore: company.description,
			imageOriginBefore: company.imageOrigin,
			descriptionAfter:  newDescription,
			imageOriginAfter:  newImageOrigin,
		});

		redirect(302, '/submit?submitted=1');
	},
};
