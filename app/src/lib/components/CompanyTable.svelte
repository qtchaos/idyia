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

	// cols: # + Company + Registered + Website + Type + Description + Size + Source + [Status]
	const totalCols = $derived(showStatus ? 9 : 8);

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

	const cell  = 'border-b border-r border-[#e1e1e1] px-3 h-8 overflow-hidden';
	const hcell = 'border-b-2 border-r border-[#e1e1e1] px-3 h-8 text-left align-middle bg-white';

	function sortBtn(col: string) {
		return currentSort === col ? (currentDir === 'asc' ? '↑' : '↓') : '↕';
	}
	function sortCls(col: string) {
		return currentSort === col ? 'text-black' : 'text-black/20 group-hover:text-black/40';
	}
</script>

<div class="w-full overflow-x-auto">
	<table
		class="w-full text-[13px] border-separate border-spacing-0 border-l border-t border-[#e1e1e1]"
		style="min-width: 1000px"
	>
		<thead>
			<tr>
				<th class="{hcell} w-10 bg-[#f9f9f9] border-b-2"></th>

				<th class="{hcell} w-44">
					<button onclick={() => toggleSort('name')} class="flex items-center gap-1 text-[11px] font-semibold text-black/50 hover:text-black transition-colors group">
						Company <span class="{sortCls('name')} transition-colors">{sortBtn('name')}</span>
					</button>
				</th>

				<th class="{hcell} w-40">
					<span class="text-[11px] font-semibold text-black/50">Registered</span>
				</th>

				<th class="{hcell} w-36">
					<span class="text-[11px] font-semibold text-black/50">Website</span>
				</th>

				<th class="{hcell} w-28">
					<button onclick={() => toggleSort('company_type')} class="flex items-center gap-1 text-[11px] font-semibold text-black/50 hover:text-black transition-colors group">
						Type <span class="{sortCls('company_type')} transition-colors">{sortBtn('company_type')}</span>
					</button>
				</th>

				<th class="{hcell}">
					<span class="text-[11px] font-semibold text-black/50">Description</span>
				</th>

				<th class="{hcell} w-32">
					<button onclick={() => toggleSort('company_size')} class="flex items-center gap-1 text-[11px] font-semibold text-black/50 hover:text-black transition-colors group">
						Size <span class="{sortCls('company_size')} transition-colors">{sortBtn('company_size')}</span>
					</button>
				</th>

				<th class="{hcell} {showStatus ? '' : 'border-r-0'}">
					<span class="text-[11px] font-semibold text-black/50">Source</span>
				</th>

				{#if showStatus}
				<th class="{hcell} w-28 border-r-0">
					<span class="text-[11px] font-semibold text-black/50">Status</span>
				</th>
				{/if}
			</tr>
		</thead>

		<tbody>
			{#each companies as company, i (company.id)}
				<tr class="hover:bg-[#f7f8fa]">
					<!-- # -->
					<td class="border-b border-r border-[#e1e1e1] h-8 w-10 text-right pr-2 text-[11px] text-black/25 align-middle bg-[#f9f9f9] select-none">
						{i + 1}
					</td>

					<!-- Company -->
					<td class="{cell} align-middle font-medium text-black">
						<span class="block truncate">{company.name}</span>
					</td>

					<!-- Registered -->
					<td class="{cell} align-middle">
						{#if company.registeredName}
							{#if company.registryUrl}
								<a href={company.registryUrl} target="_blank" rel="noopener noreferrer"
									class="block truncate text-black/60 underline underline-offset-2 hover:text-black transition-colors"
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
						<a href={company.website} target="_blank" rel="noopener noreferrer"
							class="block truncate text-black/60 underline underline-offset-2 hover:text-black transition-colors"
						>{hostname(company.website)}</a>
					</td>

					<!-- Type -->
					<td class="{cell} align-middle cursor-pointer"
						onclick={() => toggleFilter('type', company.companyType)}>
						<TypeBadge type={company.companyType} />
					</td>

					<!-- Description -->
					<td class="{cell} align-middle text-black/55">
						<span class="block truncate">{company.description}</span>
					</td>

					<!-- Size -->
					<td class="{cell} align-middle cursor-pointer"
						onclick={() => toggleFilter('size', company.companySize)}>
						<SizeBadge code={company.companySize as any} />
					</td>

					<!-- Source -->
					<td class="{cell} align-middle {showStatus ? '' : 'border-r-0'}">
						{#if company.imageOrigin || company.imageUrl}
							<a href={company.imageOrigin ?? company.imageUrl ?? '#'} target="_blank" rel="noopener noreferrer"
								class="block truncate text-black/50 underline underline-offset-2 hover:text-black transition-colors"
							>{company.imageOrigin ?? company.imageUrl}</a>
						{:else}
							<span class="text-black/15">—</span>
						{/if}
					</td>

					{#if showStatus}
					<!-- Status -->
					<td class="{cell} align-middle border-r-0">
						<StatusBadge status={company.status} />
					</td>
					{/if}
				</tr>
			{/each}

			{#if companies.length === 0}
				<tr>
					<td colspan={totalCols} class="border-b border-[#e1e1e1] py-16 text-center text-sm text-black/25">
						No companies found.
					</td>
				</tr>
			{:else if hasMore}
				<tr>
					<td colspan={totalCols} class="border-b border-[#e1e1e1] py-3 text-center">
						<button onclick={onLoadMore}
							class="px-4 py-1.5 text-[11px] border border-black/20 rounded hover:bg-black hover:text-white transition-colors uppercase tracking-wide"
						>Load more</button>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan={totalCols} class="border-b border-[#e1e1e1] py-2 pl-3 text-[11px] text-black/20">
						{companies.length} {companies.length === 1 ? 'record' : 'records'}
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>
