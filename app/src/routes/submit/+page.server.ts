import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/index';
import { companies } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/auth/login');
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Unauthenticated' });

		const data = await request.formData();
		const name = data.get('name')?.toString().trim();
		const website = data.get('website')?.toString().trim();
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
			registryUrl: data.get('registryUrl')?.toString() || null,
			urlRegex: data.get('urlRegex')?.toString() || null,
			imageUrl: null,
			imageOrigin: data.get('imageOrigin')?.toString() || null,
			status: isTrusted ? 'approved' : 'pending',
			submittedBy: locals.user.id,
		});

		redirect(302, isTrusted ? '/' : '/submit?submitted=1');
	},
};
