<script lang="ts">
	import type { PageData } from './$types';
	import CompanyTable from '$lib/components/CompanyTable.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import PageSizeSelector from '$lib/components/PageSizeSelector.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let companies = $state<typeof data.companies>([]);
	let hasMore = $state(false);
	let loading = $state(false);

	$effect(() => {
		companies = data.companies;
		hasMore = data.hasMore;
	});

	const activeType = $derived(page.url.searchParams.get('type'));
	const activeSize = $derived(page.url.searchParams.get('size'));

	function clearFilter(key: string) {
		const params = new URLSearchParams(page.url.searchParams);
		params.delete(key);
		goto(`?${params}`, { replaceState: true });
	}

	async function loadMore() {
		if (loading || !hasMore) return;
		loading = true;
		const params = new URLSearchParams(page.url.searchParams);
		const res = await fetch(`/api/companies?${params}`);
		const json = await res.json();
		companies = [...companies, ...json.rows];
		hasMore = json.hasMore;
		loading = false;
	}
</script>

<!-- Toolbar -->
<div class="h-9 shrink-0 flex items-center border-b border-[#e1e1e1] bg-white px-3 gap-3">
	<SearchBar />
	<div class="w-px h-4 bg-black/10"></div>
	<PageSizeSelector />

	{#if activeType}
		<div class="w-px h-4 bg-black/10"></div>
		<button
			onclick={() => clearFilter('type')}
			class="flex items-center gap-1 h-6 px-2 text-[11px] bg-blue-50 border border-blue-200 text-blue-700 rounded hover:bg-blue-100 transition-colors"
		>
			type: {activeType}
			<span class="text-blue-400 ml-0.5">×</span>
		</button>
	{/if}

	{#if activeSize}
		<div class="w-px h-4 bg-black/10"></div>
		<button
			onclick={() => clearFilter('size')}
			class="flex items-center gap-1 h-6 px-2 text-[11px] bg-blue-50 border border-blue-200 text-blue-700 rounded hover:bg-blue-100 transition-colors"
		>
			size: {activeSize}
			<span class="text-blue-400 ml-0.5">×</span>
		</button>
	{/if}

	{#if data.user}
		<div class="w-px h-4 bg-black/10 ml-auto"></div>
		<a href="/submit" class="h-6 px-3 text-[11px] bg-black text-white rounded hover:bg-black/75 transition-colors flex items-center">
			+ submit
		</a>
	{:else}
		<div class="ml-auto text-[11px] text-black/30">
			<a href="/auth/login" class="hover:text-black underline">sign in to submit</a>
		</div>
	{/if}
</div>

<!-- Table fills remaining height -->
<div class="flex-1 min-h-0 overflow-auto">
	<CompanyTable
		{companies}
		{hasMore}
		showStatus={data.role === 'moderator' || data.role === 'admin'}
		onLoadMore={loadMore}
	/>
	{#if loading}
		<div class="py-3 text-center text-[11px] text-black/25">loading…</div>
	{/if}
</div>
