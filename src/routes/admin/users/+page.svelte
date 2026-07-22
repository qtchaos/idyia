<script lang="ts">
	import type { PageData } from './$types';
	import KarmaBadge from '$lib/components/KarmaBadge.svelte';

	let { data }: { data: PageData } = $props();

	let q = $state('');

	const filtered = $derived(
		q.trim()
			? data.users.filter(
					(u) =>
						u.name.toLowerCase().includes(q.toLowerCase()) ||
						u.email.toLowerCase().includes(q.toLowerCase()),
				)
			: data.users,
	);

	const roleLabels: Record<string, string> = {
		contributor: 'Contributor',
		trusted_contributor: 'Trusted',
		moderator: 'Moderator',
		admin: 'Admin',
	};

	const roleCls: Record<string, string> = {
		contributor: 'bg-[#f5f5f5] text-black/50 border-[#e1e1e1]',
		trusted_contributor: 'bg-blue-50 text-blue-700 border-blue-200',
		moderator: 'bg-amber-50 text-amber-700 border-amber-200',
		admin: 'bg-purple-50 text-purple-700 border-purple-200',
	};
</script>

<a href="/admin" class="text-[12px] text-black/35 hover:text-black transition-colors mb-1 block">← back</a>
<div class="flex items-baseline gap-4 mb-5">
	<h1 class="text-2xl">Users</h1>
	<span class="text-[13px] text-black/35">{data.users.length} total</span>
</div>

<div class="mb-4">
	<input
		type="search"
		placeholder="Search by name or email…"
		bind:value={q}
		class="w-full h-8 px-3 text-[13px] border border-[#e1e1e1] rounded focus:outline-none focus:border-black/40 bg-white"
	/>
</div>

<div class="border border-[#e1e1e1] rounded overflow-hidden">
	<div class="grid grid-cols-[1fr_1fr_90px_80px_32px] border-b-2 border-[#e1e1e1] bg-white">
		<div class="px-4 py-2 text-[11px] font-semibold text-black/45">Name</div>
		<div class="px-4 py-2 text-[11px] font-semibold text-black/45 border-l border-[#e1e1e1]">Email</div>
		<div class="px-4 py-2 text-[11px] font-semibold text-black/45 border-l border-[#e1e1e1]">Role</div>
		<div class="px-4 py-2 text-[11px] font-semibold text-black/45 border-l border-[#e1e1e1]">Karma</div>
		<div class="border-l border-[#e1e1e1]"></div>
	</div>

	{#each filtered as u, i}
		<div class="grid grid-cols-[1fr_1fr_90px_80px_32px] {i < filtered.length - 1 ? 'border-b border-[#e1e1e1]' : ''} hover:bg-[#f7f8fa] transition-colors">
			<div class="px-4 h-9 flex items-center text-[13px] font-medium truncate">{u.name}</div>
			<div class="px-4 h-9 flex items-center text-[13px] text-black/50 truncate border-l border-[#e1e1e1]">{u.email}</div>
			<div class="px-3 h-9 flex items-center border-l border-[#e1e1e1]">
				<span class="inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium border rounded {roleCls[u.role ?? 'contributor']}">
					{roleLabels[u.role ?? 'contributor']}
				</span>
			</div>
			<div class="px-3 h-9 flex items-center border-l border-[#e1e1e1]">
				<KarmaBadge karma={u.karma ?? 0} />
			</div>
			<div class="h-9 flex items-center justify-center border-l border-[#e1e1e1]">
				<a
					href="/admin/users/{u.id}"
					class="text-[13px] text-black/30 hover:text-black transition-colors px-2"
					title="View profile"
				>→</a>
			</div>
		</div>
	{/each}

	{#if filtered.length === 0}
		<div class="px-4 py-8 text-center text-[13px] text-black/30">
			{q ? 'No users match your search.' : 'No users yet.'}
		</div>
	{/if}
</div>
