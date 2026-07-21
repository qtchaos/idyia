<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutData } from './$types';
	import { createAuthClient } from 'better-auth/client';
	import { page } from '$app/state';

	let { children, data }: { children: any; data: LayoutData } = $props();
	const client = createAuthClient();

	async function logout() {
		await client.signOut({
			fetchOptions: { onSuccess: () => { window.location.href = '/'; } },
		});
	}

	const isHomepage = $derived(page.url.pathname === '/');

	function backUrl(path: string): string | null {
		if (path === '/') return null;
		if (path.match(/^\/admin\/companies\//)) return '/admin/pending';
		if (path.startsWith('/admin/pending'))   return '/admin';
		if (path.startsWith('/admin/users'))     return '/admin';
		if (path.startsWith('/admin'))           return '/';
		if (path.startsWith('/submit'))          return '/';
		if (path.startsWith('/auth/'))           return '/';
		return null;
	}

	const back = $derived(backUrl(page.url.pathname));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>idyia</title>
</svelte:head>

<div class="flex flex-col" style="height:100dvh">
	<header class="flex items-center justify-between px-4 h-9 shrink-0 border-b border-[#e1e1e1] bg-white">
		<!-- Left: logo or back button -->
		{#if back}
			<a href={back} class="flex items-center gap-1.5 text-[13px] text-black/40 hover:text-black transition-colors">
				<span class="text-base leading-none">←</span>
				<span>back</span>
			</a>
		{:else}
			<a href="/" class="text-sm leading-none">idyia</a>
		{/if}

		<!-- Right: nav -->
		<div class="flex items-center gap-3 text-xs">
			{#if data.user}
				{#if data.role === 'moderator' || data.role === 'admin'}
					<a href="/admin" class="text-black/50 hover:text-black transition-colors">admin</a>
				{/if}
				{#if !isHomepage}
					<a href="/" class="text-black/50 hover:text-black transition-colors">home</a>
				{/if}
				<a href="/submit" class="text-black/50 hover:text-black transition-colors">submit</a>
				<button onclick={logout} class="text-black/35 hover:text-black transition-colors">sign out</button>
			{:else}
				<a href="/auth/register" class="text-black/50 hover:text-black transition-colors">register</a>
				<a href="/auth/login" class="px-2.5 py-1 bg-black text-white rounded hover:bg-black/80 transition-colors">sign in</a>
			{/if}
		</div>
	</header>

	<!-- Content -->
	<div class="flex-1 flex flex-col overflow-auto">
		{#if isHomepage}
			{@render children()}
		{:else}
			<div class="w-full max-w-3xl mx-auto px-6 py-10 flex-1 flex flex-col">
				{@render children()}
			</div>
		{/if}
	</div>
</div>
