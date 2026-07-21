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

<main class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
	<div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Companies using AI</h1>
			<p class="text-sm text-black/40 mt-0.5">A community-maintained directory</p>
		</div>
		<div class="flex flex-wrap items-center gap-3">
			<SearchBar />
			<PageSizeSelector />
			{#if data.user}
				<a
					href="/submit"
					class="px-3 py-1.5 text-sm bg-black text-white rounded hover:bg-black/80 transition-colors"
				>+ Submit</a>
			{:else}
				<a
					href="/auth/login"
					class="px-3 py-1.5 text-sm border border-black/20 rounded hover:bg-black/5 transition-colors"
				>Sign in to submit</a>
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
		<p class="text-center text-xs text-black/30 py-4">Loading…</p>
	{/if}
</main>
