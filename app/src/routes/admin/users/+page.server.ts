import { db } from '$lib/server/db/index';
import { user, userRole } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const users = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			role: userRole.role,
		})
		.from(user)
		.leftJoin(userRole, eq(user.id, userRole.userId))
		.all();

	return { users };
};
