import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (locals.role !== 'moderator' && locals.role !== 'admin') {
		throw error(403, 'Forbidden');
	}
	return { role: locals.role };
};
