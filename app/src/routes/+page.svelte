<script lang="ts">
	import type { PageData } from './$types';
	import CompanyTable from '$lib/components/CompanyTable.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import PageSizeSelector from '$lib/components/PageSizeSelector.svelte';
	import { page } from '$app/state';

	let { data }: { data: PageData } = $props();

	let companies = $state<typeof data.companies>([]);
	let hasMore = $state(false);
	let loading = $state(false);

	$effect(() => {
		companies = data.companies;
		hasMore = data.hasMore;
	});

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

<!-- Toolbar: h-9 = 36px so sticky thead = top-[72px] (36 nav + 36 toolbar) -->
<div class="h-9 flex items-center border-b border-[#e1e1e1] bg-white px-3 gap-3">
	<SearchBar />
	<div class="w-px h-4 bg-black/10"></div>
	<PageSizeSelector />
	{#if data.user}
		<div class="w-px h-4 bg-black/10"></div>
		<a
			href="/submit"
			class="h-6 px-3 text-[11px] bg-black text-white rounded hover:bg-black/75 transition-colors flex items-center"
		>+ submit</a>
	{/if}
	<div class="ml-auto text-[11px] text-black/25">
		{#if !data.user}
			<a href="/auth/login" class="hover:text-black underline">sign in to submit</a>
		{/if}
	</div>
</div>

<CompanyTable
	{companies}
	{hasMore}
	showStatus={data.role === 'moderator' || data.role === 'admin'}
	onLoadMore={loadMore}
/>

{#if loading}
	<div class="py-3 text-center text-[11px] text-black/25">loading…</div>
{/if}
