<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let users = $state<typeof data.users>([]);
	$effect(() => { users = data.users; });

	const roles = ['contributor', 'trusted_contributor', 'moderator', 'admin'] as const;
	type Role = typeof roles[number];

	const roleLabels: Record<Role, string> = {
		contributor:         'Contributor',
		trusted_contributor: 'Trusted contributor',
		moderator:           'Moderator',
		admin:               'Admin',
	};

	async function setRole(userId: string, role: Role) {
		await fetch(`/api/admin/users/${userId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ role }),
		});
		const u = users.find(u => u.id === userId);
		if (u) u.role = role;
	}
</script>

	<div class="flex items-baseline gap-4 mb-8">
		<h1 class="text-2xl">Users</h1>
		<span class="text-[13px] text-black/35">{users.length} total</span>
	</div>

	<div class="border border-[#e1e1e1] rounded overflow-hidden">
		<!-- Header row -->
		<div class="grid grid-cols-[1fr_1fr_160px] border-b-2 border-[#e1e1e1] bg-white">
			<div class="px-4 py-2 text-[11px] font-semibold text-black/45">Name</div>
			<div class="px-4 py-2 text-[11px] font-semibold text-black/45 border-l border-[#e1e1e1]">Email</div>
			<div class="px-4 py-2 text-[11px] font-semibold text-black/45 border-l border-[#e1e1e1]">Role</div>
		</div>

		{#each users as u, i}
			<div class="grid grid-cols-[1fr_1fr_160px] {i < users.length - 1 ? 'border-b border-[#e1e1e1]' : ''} hover:bg-[#f7f8fa] transition-colors">
				<div class="px-4 h-9 flex items-center text-[13px] font-medium truncate">{u.name}</div>
				<div class="px-4 h-9 flex items-center text-[13px] text-black/50 truncate border-l border-[#e1e1e1]">{u.email}</div>
				<div class="px-3 h-9 flex items-center border-l border-[#e1e1e1]">
					<select
						value={u.role ?? 'contributor'}
						onchange={(e) => setRole(u.id, (e.target as HTMLSelectElement).value as Role)}
						class="w-full h-7 px-2 text-[12px] border border-[#e1e1e1] rounded bg-white focus:outline-none focus:border-black/40"
					>
						{#each roles as r}
							<option value={r}>{roleLabels[r]}</option>
						{/each}
					</select>
				</div>
			</div>
		{/each}

		{#if users.length === 0}
			<div class="px-4 py-8 text-center text-[13px] text-black/30">No users yet.</div>
		{/if}
	</div>
