<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
	import type { LayoutData } from './$types';
	import { createAuthClient } from 'better-auth/client';
	import Logo from '$lib/components/Logo.svelte';
	import KarmaBadge from '$lib/components/KarmaBadge.svelte';
	import { page } from '$app/state';
	import Footer from '$lib/components/Footer.svelte';

	let { children, data }: { children: any; data: LayoutData } = $props();
	const client = createAuthClient();

	async function logout() {
		await client.signOut({
			fetchOptions: { onSuccess: () => { window.location.href = '/'; } },
		});
	}

	const isHomepage = $derived(page.url.pathname === '/');

</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>idyia - catalog of genai companies</title>
</svelte:head>

<div class="flex flex-col" style="height:100dvh">
	{#if !isHomepage}
	<header class="flex items-center justify-between px-4 h-10 shrink-0 border-b border-[#e1e1e1] bg-white">
		<a href="/"><Logo /></a>

		<!-- Right: nav -->
		<div class="flex items-center gap-3 text-sm">
			{#if data.user}
				{#if data.role === 'moderator' || data.role === 'admin'}
					<a href="/admin" class="text-black/50 hover:text-black transition-colors">admin</a>
				{/if}
				{#if !isHomepage}
					<a href="/" class="text-black/50 hover:text-black transition-colors">home</a>
				{/if}
				<a href="/leaderboard" class="text-black/50 hover:text-black transition-colors">leaderboard</a>
				<button onclick={logout} class="text-black/35 hover:text-black transition-colors">sign out</button>
				<a href="/submit" class="h-6 px-3 text-[11px] bg-black text-white rounded hover:bg-black/75 transition-colors flex items-center">+ submit</a>
				<KarmaBadge karma={data.karma} />
			{:else}
				<a href="/leaderboard" class="text-black/50 hover:text-black transition-colors">leaderboard</a>
				<a href="/auth/register" class="text-black/50 hover:text-black transition-colors">register</a>
				<a href="/auth/login" class="px-2.5 py-1 bg-black text-white rounded hover:bg-black/80 transition-colors">sign in</a>
			{/if}
		</div>
	</header>
	{/if}

	<!-- Content -->
	<div class="flex-1 flex flex-col overflow-auto">
		{#if isHomepage}
			{@render children()}
			<Footer user={data.user} />
		{:else}
			<div class="w-full max-w-3xl mx-auto px-6 py-10 flex-1">
				{@render children()}
			</div>
			<Footer user={data.user} />
		{/if}
	</div>
</div>
