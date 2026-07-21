import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db/index';
import { companies } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { updateCompanyStatus } from '$lib/server/queries';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const row = await db.select().from(companies).where(eq(companies.id, params.id)).get();
	if (!row) throw error(404, 'Not found');
	return json(row);
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	const role = locals.role;
	if (role !== 'moderator' && role !== 'admin') throw error(403, 'Forbidden');

	const body = await request.json();

	if (body.status === 'approved' || body.status === 'rejected') {
		await updateCompanyStatus(params.id, body.status);
		return json({ ok: true });
	}

	const allowed = [
		'name',
		'registeredName',
		'registryUrl',
		'website',
		'companyType',
		'description',
		'companySize',
		'imageUrl',
		'imageOrigin',
	];
	const updates: Record<string, unknown> = { updatedAt: new Date() };
	for (const key of allowed) {
		if (key in body) updates[key] = body[key];
	}

	await db.update(companies).set(updates).where(eq(companies.id, params.id));
	return json({ ok: true });
};
