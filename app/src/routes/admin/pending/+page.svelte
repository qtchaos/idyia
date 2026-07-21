<script lang="ts">
	import type { PageData } from './$types';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import TypeBadge from '$lib/components/TypeBadge.svelte';

	let { data }: { data: PageData } = $props();
</script>

<main class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
	<div class="flex items-center gap-3 mb-6">
		<a href="/admin" class="text-sm text-black/40 hover:text-black transition-colors">← Admin</a>
		<h1 class="text-xl font-semibold">Pending submissions</h1>
		<span class="ml-auto text-sm text-black/40">{data.pending.length} pending</span>
	</div>

	{#if data.pending.length === 0}
		<p class="text-sm text-black/40 py-8 text-center">No pending submissions.</p>
	{:else}
		<div class="flex flex-col gap-3">
			{#each data.pending as company}
				<div class="border border-black/10 rounded-lg p-4">
					<div class="flex items-start justify-between gap-4">
						<div class="min-w-0">
							<div class="flex flex-wrap items-center gap-2 mb-1.5">
								<span class="font-medium">{company.name}</span>
								<TypeBadge type={company.companyType} />
								<StatusBadge status={company.status} />
							</div>
							<p class="text-sm text-black/60 mb-2">{company.description}</p>
							<a
								href={company.website}
								target="_blank"
								rel="noopener noreferrer"
								class="text-xs text-black/40 hover:text-black underline underline-offset-2"
							>{company.website}</a>
						</div>
						<div class="flex gap-2 shrink-0">
							<form method="POST" action="?/approve">
								<input type="hidden" name="id" value={company.id} />
								<button
									type="submit"
									class="px-3 py-1.5 text-xs bg-black text-white rounded hover:bg-black/80 transition-colors"
								>Approve</button>
							</form>
							<form method="POST" action="?/reject">
								<input type="hidden" name="id" value={company.id} />
								<button
									type="submit"
									class="px-3 py-1.5 text-xs border border-black/20 rounded hover:bg-black/5 transition-colors"
								>Reject</button>
							</form>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</main>
