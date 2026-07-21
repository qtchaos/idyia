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
	const currentDir  = $derived(page.url.searchParams.get('dir')  ?? 'desc');

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

	function toggleFilter(key: 'type' | 'size', value: string) {
		const params = new URLSearchParams(page.url.searchParams);
		if (params.get(key) === value) params.delete(key);
		else params.set(key, value);
		goto(`?${params}`, { replaceState: true });
	}

	function hostname(url: string) {
		try { return new URL(url).hostname.replace(/^www\./, ''); }
		catch { return url; }
	}

	let expandedId = $state<string | null>(null);

	// shared cell border classes
	const cell  = 'border-b border-r border-[#e1e1e1] px-3 h-8 overflow-hidden';
	const hcell = 'border-b-2 border-r border-[#e1e1e1] px-3 h-8 text-left align-middle bg-white';
</script>

<div class="w-full overflow-x-auto">
	<table
		class="w-full text-[13px] border-separate border-spacing-0 border-l border-t border-[#e1e1e1]"
		style="min-width: 900px"
	>
		<thead>
			<tr>
				<!-- Row number gutter -->
				<th class="{hcell} w-10 bg-[#f9f9f9] border-b-2"></th>

				<!-- Company -->
				<th class="{hcell} w-44">
					<button onclick={() => toggleSort('name')} class="flex items-center gap-1 text-[11px] font-semibold text-black/50 hover:text-black transition-colors group">
						Company
						<span class="{currentSort === 'name' ? 'text-black' : 'text-black/20 group-hover:text-black/40'} transition-colors">
							{currentSort === 'name' ? (currentDir === 'asc' ? '↑' : '↓') : '↕'}
						</span>
					</button>
				</th>

				<!-- Registered -->
				<th class="{hcell} w-40">
					<span class="text-[11px] font-semibold text-black/50">Registered</span>
				</th>

				<!-- Website -->
				<th class="{hcell} w-36">
					<span class="text-[11px] font-semibold text-black/50">Website</span>
				</th>

				<!-- Type -->
				<th class="{hcell} w-32">
					<button onclick={() => toggleSort('company_type')} class="flex items-center gap-1 text-[11px] font-semibold text-black/50 hover:text-black transition-colors group">
						Type
						<span class="{currentSort === 'company_type' ? 'text-black' : 'text-black/20 group-hover:text-black/40'} transition-colors">
							{currentSort === 'company_type' ? (currentDir === 'asc' ? '↑' : '↓') : '↕'}
						</span>
					</button>
				</th>

				<!-- Description -->
				<th class="{hcell}">
					<span class="text-[11px] font-semibold text-black/50">Description</span>
				</th>

				<!-- Size -->
				<th class="{hcell} w-36 {showStatus ? '' : 'border-r-0'}">
					<button onclick={() => toggleSort('company_size')} class="flex items-center gap-1 text-[11px] font-semibold text-black/50 hover:text-black transition-colors group">
						Size
						<span class="{currentSort === 'company_size' ? 'text-black' : 'text-black/20 group-hover:text-black/40'} transition-colors">
							{currentSort === 'company_size' ? (currentDir === 'asc' ? '↑' : '↓') : '↕'}
						</span>
					</button>
				</th>

				{#if showStatus}
				<!-- Status -->
				<th class="{hcell} w-28 border-r-0">
					<span class="text-[11px] font-semibold text-black/50">Status</span>
				</th>
				{/if}
			</tr>
		</thead>

		<tbody>
			{#each companies as company, i (company.id)}
				<tr
					class="group hover:bg-[#f7f8fa] cursor-pointer"
					onclick={() => (expandedId = expandedId === company.id ? null : company.id)}
				>
					<!-- Row number -->
					<td class="border-b border-r border-[#e1e1e1] h-8 w-10 text-right pr-2 text-[11px] text-black/25 align-middle bg-[#f9f9f9] select-none">
						{i + 1}
					</td>

					<!-- Company name -->
					<td class="{cell} align-middle font-medium text-black whitespace-nowrap">
						<span class="block truncate">{company.name}</span>
					</td>

					<!-- Registered name -->
					<td class="{cell} align-middle">
						{#if company.registeredName}
							{#if company.registryUrl}
								<a
									href={company.registryUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="block truncate text-black/60 underline underline-offset-2 hover:text-black transition-colors"
									onclick={(e) => e.stopPropagation()}
								>{company.registeredName}</a>
							{:else}
								<span class="block truncate text-black/60">{company.registeredName}</span>
							{/if}
						{:else}
							<span class="text-black/15">—</span>
						{/if}
					</td>

					<!-- Website -->
					<td class="{cell} align-middle">
						<a
							href={company.website}
							target="_blank"
							rel="noopener noreferrer"
							class="block truncate text-black/60 underline underline-offset-2 hover:text-black transition-colors"
							onclick={(e) => e.stopPropagation()}
						>{hostname(company.website)}</a>
					</td>

					<!-- Type badge -->
					<td
						class="{cell} align-middle cursor-pointer"
						onclick={(e) => { e.stopPropagation(); toggleFilter('type', company.companyType); }}
					>
						<TypeBadge type={company.companyType} />
					</td>

					<!-- Description -->
					<td class="{cell} align-middle text-black/55">
						<span class="block truncate">{company.description}</span>
					</td>

					<!-- Size badge -->
					<td
						class="{cell} align-middle cursor-pointer {showStatus ? '' : 'border-r-0'}"
						onclick={(e) => { e.stopPropagation(); toggleFilter('size', company.companySize); }}
					>
						<SizeBadge code={company.companySize as any} />
					</td>

					{#if showStatus}
					<!-- Status badge -->
					<td class="{cell} align-middle border-r-0">
						<StatusBadge status={company.status} />
					</td>
					{/if}
				</tr>

				<!-- Expanded detail row -->
				{#if expandedId === company.id}
					<tr class="bg-[#fafafa]">
						<td class="border-b border-r border-[#e1e1e1] bg-[#f9f9f9]"></td>
						<td colspan={showStatus ? 7 : 6} class="border-b border-r-0 border-[#e1e1e1] px-4 py-3">
							<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12px]">
								<div class="sm:col-span-2">
									<p class="text-[10px] text-black/30 mb-1">Description</p>
									<p class="text-black/70 leading-relaxed">{company.description}</p>
								</div>
								{#if company.imageOrigin || company.imageUrl}
									<div>
										<p class="text-[10px] text-black/30 mb-1">Source</p>
										<a
											href={company.imageOrigin ?? company.imageUrl ?? '#'}
											target="_blank"
											rel="noopener noreferrer"
											class="text-black/50 hover:text-black underline underline-offset-2 break-all leading-relaxed"
										>{company.imageOrigin ?? company.imageUrl}</a>
									</div>
								{/if}
							</div>
						</td>
					</tr>
				{/if}
			{/each}

			<!-- Load more / count row -->
			{#if companies.length === 0}
				<tr>
					<td colspan={showStatus ? 9 : 8} class="border-b border-[#e1e1e1] py-16 text-center text-sm text-black/25">
						No companies found.
					</td>
				</tr>
			{:else if hasMore}
				<tr>
					<td colspan={showStatus ? 9 : 8} class="border-b border-[#e1e1e1] py-3 text-center">
						<button
							onclick={onLoadMore}
							class="px-4 py-1.5 text-[11px] border border-black/20 rounded hover:bg-black hover:text-white transition-colors uppercase tracking-wide"
						>Load more</button>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan={showStatus ? 9 : 8} class="border-b border-[#e1e1e1] py-2 pl-3 text-[11px] text-black/20">
						{companies.length} {companies.length === 1 ? 'record' : 'records'}
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>
