<script lang="ts">
	import type { PageData } from './$types';
	import CompanyTable from '$lib/components/CompanyTable.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { untrack } from 'svelte';
	import { createAuthClient } from 'better-auth/client';

	const authClient = createAuthClient();
	async function logout() {
		await authClient.signOut({
			fetchOptions: { onSuccess: () => { window.location.href = '/'; } },
		});
	}

	let { data }: { data: PageData } = $props();

	let companies   = $state<typeof data.companies>([]);
	let hasMore     = $state(false);
	let loading     = $state(true);
	let animateFrom = $state(0);
	let version     = $state(0);

	// Sync when SvelteKit re-runs the server load (sort/filter/search navigation)
	$effect(() => {
		animateFrom = 0;
		untrack(() => version++);
		companies   = data.companies;
		hasMore     = data.hasMore;
		loading     = false;
	});

	const activeType = $derived(page.url.searchParams.get('type'));
	const activeSize = $derived(page.url.searchParams.get('size'));

	function clearFilter(key: string) {
		const params = new URLSearchParams(page.url.searchParams);
		params.delete(key);
		goto(`?${params}`, { replaceState: true });
	}

	let scrollEl: HTMLDivElement;
	let sentinel: HTMLDivElement;

	async function loadMore() {
		if (loading || !hasMore) return;
		animateFrom = companies.length;
		loading = true;
		const params = new URLSearchParams(page.url.searchParams);
		params.set('offset', String(companies.length));
		const res  = await fetch(`/api/companies?${params}`);
		const json = await res.json();
		companies  = [...companies, ...json.rows];
		hasMore    = json.hasMore;
		loading    = false;
	}

	$effect(() => {
		if (!sentinel || !scrollEl) return;
		const obs = new IntersectionObserver(
			(entries) => { if (entries[0].isIntersecting) loadMore(); },
			{ root: scrollEl, rootMargin: '300px' }
		);
		obs.observe(sentinel);
		return () => obs.disconnect();
	});
</script>

<!-- Combined header + toolbar -->
<div class="h-10 shrink-0 flex items-center border-b border-[#e1e1e1] bg-white px-4 gap-3">
	<a href="/"><Logo /></a>
	<div class="w-px h-4 bg-black/15"></div>
	<SearchBar />

	{#if activeType}
		<div class="w-px h-4 bg-black/10"></div>
		<button onclick={() => clearFilter('type')}
			class="flex items-center gap-1 h-6 px-2 text-[11px] bg-blue-50 border border-blue-200 text-blue-700 rounded hover:bg-blue-100 transition-colors">
			type: {activeType} <span class="text-blue-400 ml-0.5">×</span>
		</button>
	{/if}
	{#if activeSize}
		<div class="w-px h-4 bg-black/10"></div>
		<button onclick={() => clearFilter('size')}
			class="flex items-center gap-1 h-6 px-2 text-[11px] bg-blue-50 border border-blue-200 text-blue-700 rounded hover:bg-blue-100 transition-colors">
			size: {activeSize} <span class="text-blue-400 ml-0.5">×</span>
		</button>
	{/if}

	{#if data.user}
		<div class="ml-auto flex items-center gap-3 text-sm">
			{#if data.role === 'moderator' || data.role === 'admin'}
				<a href="/admin" class="text-black/50 hover:text-black transition-colors">admin</a>
			{/if}
			<button onclick={logout} class="text-black/35 hover:text-black transition-colors">sign out</button>
			<a href="/submit" class="h-6 px-3 text-[11px] bg-black text-white rounded hover:bg-black/75 transition-colors flex items-center">+ submit</a>
		</div>
	{:else}
		<div class="ml-auto flex items-center gap-3 text-sm">
			<a href="/auth/register" class="text-black/50 hover:text-black transition-colors">register</a>
			<a href="/auth/login" class="px-2.5 py-1 bg-black text-white rounded hover:bg-black/80 transition-colors">sign in</a>
		</div>
	{/if}
</div>

<!-- Scroll container -->
<div class="flex-1 min-h-0 overflow-auto" bind:this={scrollEl}>
	<CompanyTable
		{companies}
		{hasMore}
		{loading}
		{animateFrom}
		{version}
		showStatus={data.role === 'moderator' || data.role === 'admin'}
	/>
	<div bind:this={sentinel} class="h-px"></div>
</div>
