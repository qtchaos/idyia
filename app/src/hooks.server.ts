import { auth } from '$lib/server/auth';
import { getUserRole } from '$lib/server/queries';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.user = session.user;
		event.locals.session = session.session;
		event.locals.role = await getUserRole(session.user.id);
	} else {
		event.locals.user = null;
		event.locals.session = null;
		event.locals.role = null;
	}

	return resolve(event);
};
