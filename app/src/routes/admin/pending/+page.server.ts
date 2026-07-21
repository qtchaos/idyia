import { error } from '@sveltejs/kit';
import { getPendingCompanies, updateCompanyStatus } from '$lib/server/queries';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const pending = await getPendingCompanies();
	return { pending };
};

export const actions: Actions = {
	approve: async ({ request, locals }) => {
		if (locals.role !== 'moderator' && locals.role !== 'admin') throw error(403);
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (id) await updateCompanyStatus(id, 'approved');
	},
	reject: async ({ request, locals }) => {
		if (locals.role !== 'moderator' && locals.role !== 'admin') throw error(403);
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (id) await updateCompanyStatus(id, 'rejected');
	},
};
