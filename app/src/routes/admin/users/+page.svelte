<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const roles = ['contributor', 'trusted_contributor', 'moderator', 'admin'];

	let users = $state<typeof data.users>([]);

	$effect(() => {
		users = data.users;
	});

	async function setRole(userId: string, role: string) {
		await fetch(`/api/admin/users/${userId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ role }),
		});
		const u = users.find((u) => u.id === userId);
		if (u) u.role = role as any;
	}
</script>

<main class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
	<div class="flex items-center gap-3 mb-6">
		<a href="/admin" class="text-sm text-black/40 hover:text-black transition-colors">← Admin</a>
		<h1 class="text-xl font-semibold">Users</h1>
		<span class="ml-auto text-sm text-black/40">{users.length} users</span>
	</div>

	<table class="w-full text-sm border-collapse">
		<thead>
			<tr class="border-b-2 border-black">
				<th class="text-left px-3 py-2.5 text-xs uppercase tracking-wide text-black/50">Name</th>
				<th class="text-left px-3 py-2.5 text-xs uppercase tracking-wide text-black/50">Email</th>
				<th class="text-left px-3 py-2.5 text-xs uppercase tracking-wide text-black/50">Role</th>
			</tr>
		</thead>
		<tbody>
			{#each users as u}
				<tr class="border-b border-black/8">
					<td class="px-3 py-2.5 font-medium">{u.name}</td>
					<td class="px-3 py-2.5 text-black/50">{u.email}</td>
					<td class="px-3 py-2.5">
						<select
							value={u.role ?? 'contributor'}
							onchange={(e) => setRole(u.id, (e.target as HTMLSelectElement).value)}
							class="text-xs border border-black/20 rounded px-2 py-1 bg-white focus:outline-none focus:border-black/60"
						>
							{#each roles as r}
								<option value={r}>{r.replace(/_/g, ' ')}</option>
							{/each}
						</select>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</main>
