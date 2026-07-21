import { error } from '@sveltejs/kit';
import { getPendingCompanies, getPendingAmendments, updateCompanyStatus, updateAmendmentStatus } from '$lib/server/queries';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const [pending, amendments] = await Promise.all([
		getPendingCompanies(),
		getPendingAmendments(),
	]);
	return { pending, amendments };
};

export const actions: Actions = {
	approveCompany: async ({ request, locals }) => {
		if (locals.role !== 'moderator' && locals.role !== 'admin') throw error(403);
		const id = (await request.formData()).get('id')?.toString();
		if (id) await updateCompanyStatus(id, 'approved');
	},
	rejectCompany: async ({ request, locals }) => {
		if (locals.role !== 'moderator' && locals.role !== 'admin') throw error(403);
		const id = (await request.formData()).get('id')?.toString();
		if (id) await updateCompanyStatus(id, 'rejected');
	},
	approveAmendment: async ({ request, locals }) => {
		if (locals.role !== 'moderator' && locals.role !== 'admin') throw error(403);
		const id = (await request.formData()).get('id')?.toString();
		if (id) await updateAmendmentStatus(id, 'approved');
	},
	rejectAmendment: async ({ request, locals }) => {
		if (locals.role !== 'moderator' && locals.role !== 'admin') throw error(403);
		const id = (await request.formData()).get('id')?.toString();
		if (id) await updateAmendmentStatus(id, 'rejected');
	},
};
