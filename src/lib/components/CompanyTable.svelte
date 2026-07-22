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
		loading = false,
		showStatus = false,
		animateFrom = 0,
		version = 0,
	}: {
		companies: Company[];
		hasMore: boolean;
		loading?: boolean;
		showStatus?: boolean;
		animateFrom?: number;
		version?: number;
	} = $props();

	const currentSort = $derived(page.url.searchParams.get('sort') ?? 'created_at');
	const currentDir  = $derived(page.url.searchParams.get('dir')  ?? 'desc');
	const totalCols   = $derived(showStatus ? 11 : 9);

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

	function toggleFilter(key: 'type' | 'size' | 'country', value: string) {
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
	const hcell = 'border-b-2 border-r border-[#e1e1e1] px-3 h-8 text-left align-middle bg-white relative select-none';

	function sortBtn(col: string) {
		return currentSort === col ? (currentDir === 'asc' ? '↑' : '↓') : '↕';
	}
	function sortCls(col: string) {
		return currentSort === col ? 'text-black' : 'text-black/20 group-hover:text-black/40';
	}

	// ── Column resizing ───────────────────────────────────────────────────────
	// null = not yet resized; CSS / Tailwind classes define widths as normal.
	// On the first drag we snapshot rendered widths from the DOM and switch to
	// colgroup mode so subsequent drags have full control.
	let colWidths = $state<number[] | null>(null);
	let drag: { idx: number; startX: number; startW: number } | null = null;
	let isDragging = $state(false);
	let theadRow: HTMLTableRowElement;

	function startResize(e: MouseEvent, idx: number) {
		e.preventDefault();

		// Snapshot rendered widths on first drag
		if (!colWidths) {
			colWidths = Array.from(theadRow.querySelectorAll('th'))
				.map(th => (th as HTMLElement).getBoundingClientRect().width);
		}

		drag = { idx, startX: e.clientX, startW: colWidths[idx] };
		isDragging = true;
	}

	function onMouseMove(e: MouseEvent) {
		if (!drag || !colWidths) return;
		const delta = e.clientX - drag.startX;
		colWidths[drag.idx] = Math.max(48, drag.startW + delta);
	}

	function onMouseUp() {
		drag = null;
		isDragging = false;
	}

	const tableMinWidth = $derived(
		colWidths
			? colWidths.slice(0, (showStatus ? 11 : 9) - 1).reduce((a, b) => a + b, 0) + 'px'
			: '1000px'
	);
</script>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} />

<div class="w-full overflow-x-auto" class:cursor-col-resize={isDragging}>
	<table
		class="table-fixed text-[13px] border-separate border-spacing-0 border-l border-t border-[#e1e1e1]"
		style="width:100%; min-width:{tableMinWidth}"
	>
		<!-- Colgroup is only rendered after the first resize so the default
		     CSS-driven layout is preserved until the user actually drags. -->
		{#if colWidths}
			<colgroup>
				<!-- All columns except the last get explicit widths; the last auto-fills -->
				{#each colWidths.slice(0, (showStatus ? 11 : 9) - 1) as w}
					<col style="width:{w}px" />
				{/each}
				<col />
			</colgroup>
		{/if}

		<thead class="header-row">
			<tr bind:this={theadRow}>
				<!-- # — fixed, no resize handle -->
				<th class="{hcell} w-10 bg-[#f9f9f9] border-b-2"></th>

				<th class="{hcell} w-44">
					<button onclick={() => toggleSort('name')} class="flex items-center gap-1 text-[11px] font-semibold text-black/50 hover:text-black transition-colors group">
						Company <span class="{sortCls('name')} transition-colors">{sortBtn('name')}</span>
					</button>
					<div class="resizer" onmousedown={(e) => startResize(e, 1)}></div>
				</th>

				<th class="{hcell} w-40">
					<span class="text-[11px] font-semibold text-black/50">Registered</span>
					<div class="resizer" onmousedown={(e) => startResize(e, 2)}></div>
				</th>

				<th class="{hcell} w-56">
					<span class="text-[11px] font-semibold text-black/50">Website</span>
					<div class="resizer" onmousedown={(e) => startResize(e, 3)}></div>
				</th>

				<th class="{hcell} w-36">
					<button onclick={() => toggleSort('company_type')} class="flex items-center gap-1 text-[11px] font-semibold text-black/50 hover:text-black transition-colors group">
						Type <span class="{sortCls('company_type')} transition-colors">{sortBtn('company_type')}</span>
					</button>
					<div class="resizer" onmousedown={(e) => startResize(e, 4)}></div>
				</th>

				<th class="{hcell} w-4xl">
					<span class="text-[11px] font-semibold text-black/50">Description</span>
					<div class="resizer" onmousedown={(e) => startResize(e, 5)}></div>
				</th>

				<th class="{hcell} w-40">
					<button onclick={() => toggleSort('company_size')} class="flex items-center gap-1 text-[11px] font-semibold text-black/50 hover:text-black transition-colors group">
						Size <span class="{sortCls('company_size')} transition-colors">{sortBtn('company_size')}</span>
					</button>
					<div class="resizer" onmousedown={(e) => startResize(e, 6)}></div>
				</th>

				<th class="{hcell} w-36">
					<span class="text-[11px] font-semibold text-black/50">Location</span>
					<div class="resizer" onmousedown={(e) => startResize(e, 7)}></div>
				</th>

				<th class="{hcell} {showStatus ? '' : 'border-r-0'}">
					<span class="text-[11px] font-semibold text-black/50">Source</span>
					{#if showStatus}
						<div class="resizer" onmousedown={(e) => startResize(e, 8)}></div>
					{/if}
				</th>

				{#if showStatus}
				<th class="{hcell} w-28">
					<span class="text-[11px] font-semibold text-black/50">Status</span>
					<div class="resizer" onmousedown={(e) => startResize(e, 9)}></div>
				</th>
				<th class="{hcell} w-14 border-r-0"></th>
				{/if}
			</tr>
		</thead>

		<tbody>
			{#key version}
			{#each companies as company, i (company.id)}
				<tr class="data-row hover:bg-[#f7f8fa]" style="--delay:{Math.max(0, i - animateFrom) * 35}ms">
					<td class="border-b border-r border-[#e1e1e1] h-8 w-10 text-right pr-2 text-[11px] text-black/25 align-middle bg-[#f9f9f9] select-none">
						{i + 1}
					</td>
					<td class="{cell} align-middle font-medium text-black">
						<a href="/companies/{company.id}" class="block truncate hover:underline underline-offset-2">{company.name}</a>
					</td>
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
							<span class="text-black/15">-</span>
						{/if}
					</td>
					<td class="{cell} align-middle">
						<a href={company.website} target="_blank" rel="noopener noreferrer"
							class="block truncate text-black/60 underline underline-offset-2 hover:text-black transition-colors"
						>{hostname(company.website)}</a>
					</td>
					<td class="{cell} align-middle cursor-pointer" onclick={() => toggleFilter('type', company.companyType)}>
						<TypeBadge type={company.companyType} />
					</td>
					<td class="{cell} align-middle text-black/55">
						<span class="block truncate">{company.description}</span>
					</td>
					<td class="{cell} align-middle cursor-pointer" onclick={() => toggleFilter('size', company.companySize)}>
						<SizeBadge code={company.companySize as any} />
					</td>
					<td class="{cell} align-middle cursor-pointer" onclick={() => company.country && toggleFilter('country', company.country)}>
						{#if company.country}
							<span class="block truncate text-black/60">{company.country}</span>
						{:else}
							<span class="text-black/15">-</span>
						{/if}
					</td>
					<td class="{cell} align-middle {showStatus ? '' : 'border-r-0'}">
						{#if company.imageOrigin}
							<a href={company.imageOrigin} target="_blank" rel="noopener noreferrer"
								class="block truncate text-black/50 underline underline-offset-2 hover:text-black transition-colors"
							>{company.imageOrigin}</a>
						{:else}
							<span class="text-black/15">-</span>
						{/if}
					</td>
					{#if showStatus}
					<td class="{cell} align-middle">
						<StatusBadge status={company.status} />
					</td>
					<td class="{cell} align-middle border-r-0 text-center">
						<a href="/admin/companies/{company.id}/edit"
							class="text-[11px] text-black/40 hover:text-black transition-colors" title="Edit">✎</a>
					</td>
					{/if}
				</tr>
			{/each}
			{/key}

			{#if companies.length === 0 && !loading}
				<tr>
					<td colspan={totalCols} class="border-b border-[#e1e1e1] py-16 text-center text-sm text-black/25">
						No companies found.
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>

<style>
	.header-row {
		animation: row-in 0.3s ease-out both;
	}

	.data-row {
		animation: row-in 0.25s ease-out both;
		animation-delay: var(--delay, 0ms);
	}

	@keyframes row-in {
		from { opacity: 0; transform: translateY(4px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	.resizer {
		position: absolute;
		right: 0;
		top: 0;
		height: 100%;
		width: 4px;
		cursor: col-resize;
		z-index: 1;
	}

	.resizer:hover,
	.resizer:active {
		background: rgba(0, 0, 0, 0.12);
	}
</style>
