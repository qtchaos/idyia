<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { Company } from '$lib/server/db/schema';
	import SizeBadge from './SizeBadge.svelte';
	import TypeBadge from './TypeBadge.svelte';
	import StatusBadge from './StatusBadge.svelte';

	let {
		companies,
		hasMore,
		showStatus = false,
		onLoadMore,
	}: {
		companies: Company[];
		hasMore: boolean;
		showStatus?: boolean;
		onLoadMore?: () => void;
	} = $props();

	const currentSort = $derived(page.url.searchParams.get('sort') ?? 'created_at');
	const currentDir = $derived(page.url.searchParams.get('dir') ?? 'desc');

	function toggleSort(col: string) {
		const params = new URLSearchParams(page.url.searchParams);
		if (params.get('sort') === col) {
			params.set('dir', params.get('dir') === 'asc' ? 'desc' : 'asc');
		} else {
			params.set('sort', col);
			params.set('dir', 'asc');
		}
		goto(`?${params}`, { replaceState: true });
	}

	type Col = { key: string; label: string; sortable?: boolean };
	const baseCols: Col[] = [
		{ key: 'name', label: 'Company', sortable: true },
		{ key: 'company_type', label: 'Type', sortable: true },
		{ key: 'description', label: 'Description' },
		{ key: 'company_size', label: 'Size', sortable: true },
	];
	const cols = $derived(showStatus ? [...baseCols, { key: 'status', label: 'Status' }] : baseCols);

	let expandedId = $state<string | null>(null);
</script>

<div class="overflow-x-auto">
	<table class="w-full text-sm border-collapse">
		<thead>
			<tr class="border-b-2 border-black">
				{#each cols as col}
					<th
						class="text-left px-3 py-2.5 font-semibold text-xs uppercase tracking-wide text-black/50 whitespace-nowrap"
					>
						{#if col.sortable}
							<button
								onclick={() => toggleSort(col.key)}
								class="flex items-center gap-1 hover:text-black transition-colors"
							>
								{col.label}
								{#if currentSort === col.key}
									<span class="text-black">{currentDir === 'asc' ? '↑' : '↓'}</span>
								{:else}
									<span class="text-black/20">↕</span>
								{/if}
							</button>
						{:else}
							{col.label}
						{/if}
					</th>
				{/each}
				<th class="px-3 py-2.5 w-8"></th>
			</tr>
		</thead>
		<tbody>
			{#each companies as company (company.id)}
				<tr
					class="border-b border-black/8 hover:bg-black/[0.015] cursor-pointer transition-colors"
					onclick={() => (expandedId = expandedId === company.id ? null : company.id)}
				>
					<td class="px-3 py-2.5 font-medium">
						<div class="flex flex-col leading-tight">
							<span>{company.name}</span>
							{#if company.registeredName}
								<a
									href={company.registryUrl ?? '#'}
									target="_blank"
									rel="noopener noreferrer"
									class="text-xs text-black/35 hover:text-black underline underline-offset-2"
									onclick={(e) => e.stopPropagation()}
								>{company.registeredName}</a>
							{/if}
						</div>
					</td>
					<td class="px-3 py-2.5">
						<TypeBadge type={company.companyType} />
					</td>
					<td class="px-3 py-2.5 text-black/60 max-w-xs">
						<span class="line-clamp-2">{company.description}</span>
					</td>
					<td class="px-3 py-2.5">
						<SizeBadge code={company.companySize as any} />
					</td>
					{#if showStatus}
						<td class="px-3 py-2.5">
							<StatusBadge status={company.status} />
						</td>
					{/if}
					<td class="px-3 py-2.5 text-right">
						<a
							href={company.website}
							target="_blank"
							rel="noopener noreferrer"
							class="text-black/30 hover:text-black transition-colors"
							onclick={(e) => e.stopPropagation()}
							title="Visit website"
						>↗</a>
					</td>
				</tr>
				{#if expandedId === company.id}
					<tr class="bg-black/[0.015] border-b border-black/8">
						<td colspan={cols.length + 1} class="px-4 py-4">
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
								<div>
									<p class="text-xs text-black/40 uppercase tracking-wide mb-1">Full description</p>
									<p class="text-black/80">{company.description}</p>
								</div>
								{#if company.imageOrigin || company.imageUrl}
									<div>
										<p class="text-xs text-black/40 uppercase tracking-wide mb-1">Source</p>
										<a
											href={company.imageOrigin ?? company.imageUrl ?? '#'}
											target="_blank"
											rel="noopener noreferrer"
											class="underline text-black/50 hover:text-black text-xs break-all"
										>{company.imageOrigin ?? company.imageUrl}</a>
									</div>
								{/if}
							</div>
						</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>

	{#if companies.length === 0}
		<p class="py-12 text-center text-sm text-black/30">No companies found.</p>
	{:else if hasMore}
		<div class="py-6 text-center">
			<button
				onclick={onLoadMore}
				class="px-4 py-2 text-sm border border-black/20 rounded hover:bg-black hover:text-white transition-colors"
			>
				Load more
			</button>
		</div>
	{:else}
		<p class="py-4 text-center text-xs text-black/25">
			{companies.length}
			{companies.length === 1 ? 'entry' : 'entries'}
		</p>
	{/if}
</div>
